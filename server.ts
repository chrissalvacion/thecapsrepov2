import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";
import { createApiApp } from "./backend/api-app";

dotenv.config();

const PORT = process.env.SERVER_PORT ? parseInt(process.env.SERVER_PORT) : 3000;
async function startServer() {
  const app = await createApiApp();

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n✓ Server running at http://localhost:${PORT}`);
    console.log(`✓ Connected to Supabase: ${process.env.SUPABASE_URL || "(not configured)"}`);
    console.log(`✓ Environment: ${process.env.NODE_ENV || "development"}\n`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
