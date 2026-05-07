import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { vercelMiddleware, timeoutHandler } from "./middleware";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
  : null;

type AuthUser = {
  id: string;
  email: string;
};

type AuthenticatedRequest = express.Request & {
  user?: AuthUser;
};

let bootstrapPromise: Promise<void> | null = null;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function looksLikeBcryptHash(value: string) {
  return /^\$2[aby]?\$\d{2}\$/.test(value);
}

async function verifyUserPassword(user: { id: string; password: string }, candidatePassword: string) {
  if (looksLikeBcryptHash(user.password)) {
    return bcrypt.compareSync(candidatePassword, user.password);
  }

  if (candidatePassword !== user.password) {
    return false;
  }

  const hashedPassword = bcrypt.hashSync(candidatePassword, 10);
  const { error } = await supabase!
    .from("users")
    .update({ password: hashedPassword })
    .eq("id", user.id);

  if (error) {
    throw error;
  }

  return true;
}

function mapTeam(row: any) {
  return {
    id: row.id,
    access_code: row.access_code,
    team_name: row.team_name,
    proponents: Array.isArray(row.proponents) ? row.proponents : [],
    program: row.program,
    class: row.class_code,
    email: row.email,
    contact_num: row.contact_num,
    adviser: row.adviser,
    createdAt: row.created_at,
  };
}

function mapProject(row: any) {
  return {
    id: row.id,
    teamId: row.team_id,
    project_title: row.project_title,
    school_year: row.school_year,
    description: row.description,
    objectives: row.objectives,
    status: row.status,
    createdAt: row.created_at,
  };
}

function mapDefense(row: any) {
  return {
    id: row.id,
    teamId: row.team_id,
    defense_type: row.defense_type,
    defense_date: row.defense_date,
    defense_time: row.defense_time,
    panelists: Array.isArray(row.panelists) ? row.panelists : [],
    recommendations: row.recommendations,
    suggestions: row.suggestions,
    status: row.status,
    createdAt: row.created_at,
  };
}

function mapConsultation(row: any) {
  return {
    id: row.id,
    teamId: row.team_id,
    issues: row.issues,
    recommendations: row.recommendations,
    createdAt: row.created_at,
  };
}

function mapPanelist(row: any) {
  return {
    id: row.id,
    name: row.name,
    designation: row.designation,
    position: row.position,
    email: row.email,
    contact: row.contact,
    createdAt: row.created_at,
  };
}

async function bootstrapDefaultAdmin() {
  if (!supabase) {
    return;
  }

  if (bootstrapPromise) {
    return bootstrapPromise;
  }

  bootstrapPromise = (async () => {
    const defaultAdminEmail = process.env.DEFAULT_ADMIN_EMAIL
      ? normalizeEmail(process.env.DEFAULT_ADMIN_EMAIL)
      : undefined;
    const defaultAdminPassword = process.env.DEFAULT_ADMIN_PASSWORD;
    const defaultAdminName = process.env.DEFAULT_ADMIN_NAME || "Administrator";

    if (!defaultAdminEmail || !defaultAdminPassword) {
      return;
    }

    const { data: existing, error: existingError } = await supabase
      .from("users")
      .select("id")
      .ilike("email", defaultAdminEmail)
      .limit(1);

    if (existingError) {
      throw existingError;
    }

    if (existing && existing.length > 0) {
      return;
    }

    const hashedPassword = bcrypt.hashSync(defaultAdminPassword, 10);
    const { error: insertError } = await supabase.from("users").insert({
      email: defaultAdminEmail,
      password: hashedPassword,
      name: defaultAdminName,
    });

    if (insertError) {
      throw insertError;
    }
  })();

  return bootstrapPromise;
}

async function generateUniqueAccessCode() {
  for (let i = 0; i < 20; i += 1) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const { data, error } = await supabase.from("teams").select("id").eq("access_code", code).limit(1);

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return code;
    }
  }

  throw new Error("Unable to generate unique access code");
}

function authenticate(req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET) as AuthUser;
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

function sendApiError(res: express.Response, context: string, error: unknown, fallbackMessage: string) {
  console.error(context, error);
  return res.status(500).json({ error: fallbackMessage });
}

export async function createApiApp() {
  const app = express();
  
  // Add Vercel-specific middleware first
  app.use(vercelMiddleware);
  app.use(timeoutHandler(25000)); // 25 second timeout (5 seconds buffer for Vercel 30s limit)
  
  app.use(express.json());

  if (!supabase) {
    app.use("/api", (_req, res) => {
      res.status(500).json({
        error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Add them to your .env file.",
      });
    });
    return app;
  }

  await bootstrapDefaultAdmin();

  const allowedOrigins = process.env.NODE_ENV === "production"
    ? (process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : ["*"])
    : ["*"];

  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes("*") || (origin && allowedOrigins.includes(origin))) {
      res.header("Access-Control-Allow-Origin", origin || "*");
    }
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    return next();
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const email = typeof req.body?.email === "string" ? normalizeEmail(req.body.email) : "";
      const password = typeof req.body?.password === "string" ? req.body.password : "";

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const { data: users, error } = await supabase.from("users").select("*").ilike("email", email).limit(1);

      if (error) {
        throw error;
      }

      const user = users?.[0];
      if (!user || !(await verifyUserPassword(user, password))) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
      return res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
    } catch (error) {
      return sendApiError(res, "Login error:", error, "Login failed");
    }
  });

  app.get("/api/auth/me", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const { data: user, error } = await supabase
        .from("users")
        .select("id, name, email")
        .eq("id", req.user!.id)
        .single();

      if (error) {
        if ((error as any).code === "PGRST116") {
          return res.status(404).json({ error: "User not found" });
        }
        throw error;
      }

      return res.json({ user });
    } catch (error) {
      return sendApiError(res, "Auth me error:", error, "Failed to fetch user");
    }
  });

  app.patch("/api/auth/profile", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const { name, email, currentPassword } = req.body;
      if (!name || !email || !currentPassword) {
        return res.status(400).json({ error: "Name, email, and current password are required" });
      }

      const normalizedEmail = normalizeEmail(email);

      const { data: currentUser, error: currentUserError } = await supabase
        .from("users")
        .select("id, email, password")
        .eq("id", req.user!.id)
        .single();

      if (currentUserError) {
        if ((currentUserError as any).code === "PGRST116") {
          return res.status(404).json({ error: "User not found" });
        }
        throw currentUserError;
      }

      if (!(await verifyUserPassword(currentUser, currentPassword))) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }

      if (normalizedEmail !== currentUser.email) {
        const { data: existing, error: existingError } = await supabase
          .from("users")
          .select("id")
          .ilike("email", normalizedEmail)
          .neq("id", req.user!.id)
          .limit(1);

        if (existingError) {
          throw existingError;
        }

        if (existing && existing.length > 0) {
          return res.status(409).json({ error: "Email is already in use" });
        }
      }

      const { error: updateError } = await supabase
        .from("users")
        .update({ name, email: normalizedEmail })
        .eq("id", req.user!.id);

      if (updateError) {
        throw updateError;
      }

      return res.json({ success: true, user: { id: req.user!.id, name, email: normalizedEmail } });
    } catch (error) {
      return sendApiError(res, "Update profile error:", error, "Failed to update profile");
    }
  });

  app.patch("/api/auth/password", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Current and new passwords are required" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: "New password must be at least 6 characters" });
      }

      const { data: currentUser, error: currentUserError } = await supabase
        .from("users")
        .select("id, password")
        .eq("id", req.user!.id)
        .single();

      if (currentUserError) {
        if ((currentUserError as any).code === "PGRST116") {
          return res.status(404).json({ error: "User not found" });
        }
        throw currentUserError;
      }

      if (!(await verifyUserPassword(currentUser, currentPassword))) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }

      const hashedPassword = bcrypt.hashSync(newPassword, 10);
      const { error: updateError } = await supabase
        .from("users")
        .update({ password: hashedPassword })
        .eq("id", req.user!.id);

      if (updateError) {
        throw updateError;
      }

      return res.json({ success: true });
    } catch (error) {
      return sendApiError(res, "Update password error:", error, "Failed to update password");
    }
  });

  app.get("/api/teams", async (_req, res) => {
    try {
      const { data, error } = await supabase.from("teams").select("*").order("created_at", { ascending: false });
      if (error) {
        throw error;
      }
      return res.json((data || []).map(mapTeam));
    } catch (error) {
      return sendApiError(res, "Get teams error:", error, "Failed to fetch teams");
    }
  });

  app.get("/api/teams/:id", async (req, res) => {
    try {
      const { data, error } = await supabase.from("teams").select("*").eq("id", req.params.id).single();
      if (error) {
        if ((error as any).code === "PGRST116") {
          return res.status(404).json({ error: "Not found" });
        }
        throw error;
      }
      return res.json(mapTeam(data));
    } catch (error) {
      return sendApiError(res, "Get team error:", error, "Failed to fetch team");
    }
  });

  app.post("/api/teams", authenticate, async (req, res) => {
    try {
      const accessCode = await generateUniqueAccessCode();
      const { id, team_name, proponents, program, class: classCode, email, contact_num, adviser } = req.body;

      const { error } = await supabase.from("teams").insert({
        id,
        access_code: accessCode,
        team_name,
        proponents: proponents || [],
        program,
        class_code: classCode,
        email,
        contact_num,
        adviser,
      });

      if (error) {
        throw error;
      }

      return res.json({ success: true, access_code: accessCode });
    } catch (error) {
      return sendApiError(res, "Create team error:", error, "Failed to create team");
    }
  });

  app.patch("/api/teams/:id", authenticate, async (req, res) => {
    try {
      const { team_name, proponents, program, class: classCode, email, contact_num, adviser } = req.body;
      const { error } = await supabase
        .from("teams")
        .update({
          team_name,
          proponents: proponents || [],
          program,
          class_code: classCode,
          email,
          contact_num,
          adviser,
        })
        .eq("id", req.params.id);

      if (error) {
        throw error;
      }

      return res.json({ success: true });
    } catch (error) {
      return sendApiError(res, "Update team error:", error, "Failed to update team");
    }
  });

  app.delete("/api/teams/:id", authenticate, async (req, res) => {
    try {
      const teamId = req.params.id;

      const { error: consultationsError } = await supabase.from("consultations").delete().eq("team_id", teamId);
      if (consultationsError) {
        throw consultationsError;
      }

      const { error: defensesError } = await supabase.from("defenses").delete().eq("team_id", teamId);
      if (defensesError) {
        throw defensesError;
      }

      const { error: projectsError } = await supabase.from("projects").delete().eq("team_id", teamId);
      if (projectsError) {
        throw projectsError;
      }

      const { error: teamsError } = await supabase.from("teams").delete().eq("id", teamId);
      if (teamsError) {
        throw teamsError;
      }

      return res.json({ success: true });
    } catch (error) {
      return sendApiError(res, "Delete team error:", error, "Failed to delete team");
    }
  });

  app.get("/api/student/team/:accessCode", async (req, res) => {
    try {
      const { data: team, error: teamError } = await supabase
        .from("teams")
        .select("*")
        .eq("access_code", req.params.accessCode)
        .single();

      if (teamError) {
        if ((teamError as any).code === "PGRST116") {
          return res.status(404).json({ error: "Team not found" });
        }
        throw teamError;
      }

      const { data: projects, error: projectsError } = await supabase
        .from("projects")
        .select("*")
        .eq("team_id", team.id)
        .order("created_at", { ascending: false });

      if (projectsError) {
        throw projectsError;
      }

      const { data: defenses, error: defensesError } = await supabase
        .from("defenses")
        .select("*")
        .eq("team_id", team.id)
        .order("defense_date", { ascending: false })
        .order("defense_time", { ascending: false });

      if (defensesError) {
        throw defensesError;
      }

      return res.json({
        team: mapTeam(team),
        projects: (projects || []).map(mapProject),
        defenses: (defenses || []).map(mapDefense),
      });
    } catch (error) {
      return sendApiError(res, "Student team lookup error:", error, "Failed to lookup team");
    }
  });

  app.get("/api/projects", async (req, res) => {
    try {
      const teamId = req.query.teamId as string | undefined;
      let query = supabase.from("projects").select("*").order("created_at", { ascending: false });

      if (teamId) {
        query = query.eq("team_id", teamId);
      }

      const { data, error } = await query;
      if (error) {
        throw error;
      }

      return res.json((data || []).map(mapProject));
    } catch (error) {
      return sendApiError(res, "Get projects error:", error, "Failed to fetch projects");
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const { data, error } = await supabase.from("projects").select("*").eq("id", req.params.id).single();
      if (error) {
        if ((error as any).code === "PGRST116") {
          return res.status(404).json({ error: "Project not found" });
        }
        throw error;
      }
      return res.json(mapProject(data));
    } catch (error) {
      return sendApiError(res, "Get project error:", error, "Failed to fetch project");
    }
  });

  app.post("/api/projects", authenticate, async (req, res) => {
    try {
      const { id, teamId, project_title, school_year, description, objectives, status } = req.body;
      const { error } = await supabase.from("projects").insert({
        id,
        team_id: teamId,
        project_title,
        school_year: school_year || null,
        description,
        objectives,
        status,
      });

      if (error) {
        throw error;
      }

      return res.json({ success: true });
    } catch (error) {
      return sendApiError(res, "Create project error:", error, "Failed to create project");
    }
  });

  app.patch("/api/projects/:id", authenticate, async (req, res) => {
    try {
      const { project_title, school_year, description, objectives, status } = req.body;
      const { error } = await supabase
        .from("projects")
        .update({
          project_title,
          school_year: school_year || null,
          description,
          objectives,
          status,
        })
        .eq("id", req.params.id);

      if (error) {
        throw error;
      }

      return res.json({ success: true });
    } catch (error) {
      return sendApiError(res, "Update project error:", error, "Failed to update project");
    }
  });

  app.delete("/api/projects/:id", authenticate, async (req, res) => {
    try {
      const { error } = await supabase.from("projects").delete().eq("id", req.params.id);
      if (error) {
        throw error;
      }
      return res.json({ success: true });
    } catch (error) {
      return sendApiError(res, "Delete project error:", error, "Failed to delete project");
    }
  });

  app.get("/api/defenses", async (req, res) => {
    try {
      const teamId = req.query.teamId as string | undefined;
      let query = supabase.from("defenses").select("*").order("created_at", { ascending: false });
      if (teamId) {
        query = query.eq("team_id", teamId);
      }

      const { data, error } = await query;
      if (error) {
        throw error;
      }

      return res.json((data || []).map(mapDefense));
    } catch (error) {
      return sendApiError(res, "Get defenses error:", error, "Failed to fetch defenses");
    }
  });

  app.post("/api/defenses", authenticate, async (req, res) => {
    try {
      const { id, teamId, defense_type, defense_date, defense_time, panelists, status } = req.body;
      const { error } = await supabase.from("defenses").insert({
        id,
        team_id: teamId,
        defense_type,
        defense_date,
        defense_time,
        panelists: panelists || [],
        status,
        recommendations: "",
        suggestions: "",
      });

      if (error) {
        throw error;
      }

      return res.json({ success: true });
    } catch (error) {
      return sendApiError(res, "Create defense error:", error, "Failed to create defense");
    }
  });

  app.patch("/api/defenses/:id", authenticate, async (req, res) => {
    try {
      const { status, recommendations, suggestions } = req.body;
      const { error } = await supabase
        .from("defenses")
        .update({ status, recommendations, suggestions })
        .eq("id", req.params.id);

      if (error) {
        throw error;
      }

      return res.json({ success: true });
    } catch (error) {
      return sendApiError(res, "Update defense error:", error, "Failed to update defense");
    }
  });

  app.delete("/api/defenses/:id", authenticate, async (req, res) => {
    try {
      const { error } = await supabase.from("defenses").delete().eq("id", req.params.id);
      if (error) {
        throw error;
      }
      return res.json({ success: true });
    } catch (error) {
      return sendApiError(res, "Delete defense error:", error, "Failed to delete defense");
    }
  });

  app.get("/api/consultations", async (req, res) => {
    try {
      const teamId = req.query.teamId as string | undefined;
      let query = supabase.from("consultations").select("*").order("created_at", { ascending: false });
      if (teamId) {
        query = query.eq("team_id", teamId);
      }

      const { data, error } = await query;
      if (error) {
        throw error;
      }

      return res.json((data || []).map(mapConsultation));
    } catch (error) {
      return sendApiError(res, "Get consultations error:", error, "Failed to fetch consultations");
    }
  });

  app.get("/api/consultations/:id", async (req, res) => {
    try {
      const { data, error } = await supabase.from("consultations").select("*").eq("id", req.params.id).single();
      if (error) {
        if ((error as any).code === "PGRST116") {
          return res.status(404).json({ error: "Consultation not found" });
        }
        throw error;
      }

      return res.json(mapConsultation(data));
    } catch (error) {
      return sendApiError(res, "Get consultation error:", error, "Failed to fetch consultation");
    }
  });

  app.post("/api/consultations", authenticate, async (req, res) => {
    try {
      const { id, teamId, issues, recommendations } = req.body;
      const { error } = await supabase.from("consultations").insert({
        id,
        team_id: teamId,
        issues,
        recommendations,
      });

      if (error) {
        throw error;
      }

      return res.json({ success: true });
    } catch (error) {
      return sendApiError(res, "Create consultation error:", error, "Failed to create consultation");
    }
  });

  app.patch("/api/consultations/:id", authenticate, async (req, res) => {
    try {
      const { recommendations } = req.body;
      const { error } = await supabase
        .from("consultations")
        .update({ recommendations })
        .eq("id", req.params.id);

      if (error) {
        throw error;
      }

      return res.json({ success: true });
    } catch (error) {
      return sendApiError(res, "Update consultation error:", error, "Failed to update consultation");
    }
  });

  app.get("/api/panelists", async (_req, res) => {
    try {
      const { data, error } = await supabase.from("panelists").select("*").order("name", { ascending: true });
      if (error) {
        throw error;
      }
      return res.json((data || []).map(mapPanelist));
    } catch (error) {
      return sendApiError(res, "Get panelists error:", error, "Failed to fetch panelists");
    }
  });

  app.post("/api/panelists", authenticate, async (req, res) => {
    try {
      const { id, name, designation, position, email, contact } = req.body;
      const { error } = await supabase.from("panelists").insert({
        id,
        name,
        designation,
        position,
        email,
        contact,
      });

      if (error) {
        throw error;
      }

      return res.json({ success: true });
    } catch (error) {
      return sendApiError(res, "Create panelist error:", error, "Failed to create panelist");
    }
  });

  app.patch("/api/panelists/:id", authenticate, async (req, res) => {
    try {
      const { name, designation, position, email, contact } = req.body;
      const { error } = await supabase
        .from("panelists")
        .update({ name, designation, position, email, contact })
        .eq("id", req.params.id);

      if (error) {
        throw error;
      }

      return res.json({ success: true });
    } catch (error) {
      return sendApiError(res, "Update panelist error:", error, "Failed to update panelist");
    }
  });

  app.delete("/api/panelists/:id", authenticate, async (req, res) => {
    try {
      const { error } = await supabase.from("panelists").delete().eq("id", req.params.id);
      if (error) {
        throw error;
      }
      return res.json({ success: true });
    } catch (error) {
      return sendApiError(res, "Delete panelist error:", error, "Failed to delete panelist");
    }
  });

  return app;
}
