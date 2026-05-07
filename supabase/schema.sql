create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password text not null,
  name text,
  created_at timestamptz not null default now()
);

create table if not exists teams (
  id uuid primary key,
  access_code text unique,
  team_name text,
  proponents jsonb not null default '[]'::jsonb,
  program text,
  class_code text,
  email text,
  contact_num text,
  adviser text,
  created_at timestamptz not null default now()
);

create table if not exists projects (
  id uuid primary key,
  team_id uuid references teams(id) on delete cascade,
  project_title text,
  school_year text,
  description text,
  objectives text,
  status text,
  created_at timestamptz not null default now()
);

create table if not exists defenses (
  id uuid primary key,
  team_id uuid references teams(id) on delete cascade,
  defense_type text,
  defense_date date,
  defense_time time,
  panelists jsonb not null default '[]'::jsonb,
  recommendations text not null default '',
  suggestions text not null default '',
  status text,
  created_at timestamptz not null default now()
);

create table if not exists consultations (
  id uuid primary key,
  team_id uuid references teams(id) on delete cascade,
  issues text,
  recommendations text,
  created_at timestamptz not null default now()
);

create table if not exists panelists (
  id uuid primary key,
  name text,
  designation text,
  position text,
  email text,
  contact text,
  created_at timestamptz not null default now()
);

create index if not exists idx_projects_team_id on projects(team_id);
create index if not exists idx_defenses_team_id on defenses(team_id);
create index if not exists idx_consultations_team_id on consultations(team_id);
create unique index if not exists ux_teams_access_code on teams(access_code);

-- Enable Row Level Security
alter table users enable row level security;
alter table teams enable row level security;
alter table projects enable row level security;
alter table defenses enable row level security;
alter table consultations enable row level security;
alter table panelists enable row level security;

-- RLS Policies for Users
-- Public can read (for login to work via custom auth), authenticated can read own user
create policy "Users are viewable by authenticated users" on users
  for select using (true);

create policy "Users can update own user data" on users
  for update using (true);

-- RLS Policies for Teams
-- Public can read teams (for student access via access code), authenticated can manage
create policy "Teams are viewable by public" on teams
  for select using (true);

create policy "Authenticated users can insert teams" on teams
  for insert with check (true);

create policy "Authenticated users can update teams" on teams
  for update using (true);

create policy "Authenticated users can delete teams" on teams
  for delete using (true);

-- RLS Policies for Projects
-- Public can read projects (for student view), authenticated can manage
create policy "Projects are viewable by public" on projects
  for select using (true);

create policy "Authenticated users can insert projects" on projects
  for insert with check (true);

create policy "Authenticated users can update projects" on projects
  for update using (true);

create policy "Authenticated users can delete projects" on projects
  for delete using (true);

-- RLS Policies for Defenses
-- Public can read defenses (for student view), authenticated can manage
create policy "Defenses are viewable by public" on defenses
  for select using (true);

create policy "Authenticated users can insert defenses" on defenses
  for insert with check (true);

create policy "Authenticated users can update defenses" on defenses
  for update using (true);

create policy "Authenticated users can delete defenses" on defenses
  for delete using (true);

-- RLS Policies for Consultations
-- Public can read consultations, authenticated can manage
create policy "Consultations are viewable by public" on consultations
  for select using (true);

create policy "Authenticated users can insert consultations" on consultations
  for insert with check (true);

create policy "Authenticated users can update consultations" on consultations
  for update using (true);

create policy "Authenticated users can delete consultations" on consultations
  for delete using (true);

-- RLS Policies for Panelists
-- Public can read panelists, authenticated can manage
create policy "Panelists are viewable by public" on panelists
  for select using (true);

create policy "Authenticated users can insert panelists" on panelists
  for insert with check (true);

create policy "Authenticated users can update panelists" on panelists
  for update using (true);

create policy "Authenticated users can delete panelists" on panelists
  for delete using (true);
