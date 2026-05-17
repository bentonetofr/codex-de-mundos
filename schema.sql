-- ============================================================
-- CODEX DE MUNDOS — Schema Supabase
-- Execute este SQL no painel do Supabase: SQL Editor → New query
-- ============================================================

-- Habilita UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Permissões explícitas para a Data API do Supabase
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- ─── PROFILES ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  username TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger para criar perfil automaticamente ao registrar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── UNIVERSES ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.universes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  genre TEXT NOT NULL DEFAULT 'fantasy',
  cover_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── FACTIONS ───────────────────────────────────────────────
-- Precisa existir antes de characters por causa da FK faction_id.

CREATE TABLE IF NOT EXISTS public.factions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  universe_id UUID NOT NULL REFERENCES public.universes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT,
  ideology TEXT,
  leader TEXT,
  allies TEXT,
  enemies TEXT,
  description TEXT,
  symbol_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── CHARACTERS ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.characters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  universe_id UUID NOT NULL REFERENCES public.universes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT,
  race TEXT,
  origin TEXT,
  description TEXT,
  personality TEXT,
  goals TEXT,
  allies TEXT,
  enemies TEXT,
  faction_id UUID REFERENCES public.factions(id) ON DELETE SET NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── LOCATIONS ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  universe_id UUID NOT NULL REFERENCES public.universes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'city',
  description TEXT,
  culture TEXT,
  ruler TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── EVENTS ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  universe_id UUID NOT NULL REFERENCES public.universes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  fictional_date TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  characters_involved TEXT[],
  locations_involved TEXT[],
  factions_involved TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── CREATURES ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.creatures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  universe_id UUID NOT NULL REFERENCES public.universes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT,
  description TEXT,
  abilities TEXT,
  habitat TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── RELIGIONS ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.religions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  universe_id UUID NOT NULL REFERENCES public.universes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  deity TEXT,
  dogma TEXT,
  description TEXT,
  rituals TEXT,
  symbol_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── WARS ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.wars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  universe_id UUID NOT NULL REFERENCES public.universes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date TEXT,
  end_date TEXT,
  description TEXT,
  factions_involved TEXT[],
  outcome TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── LINEAGES ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.lineages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  universe_id UUID NOT NULL REFERENCES public.universes(id) ON DELETE CASCADE,
  character_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  related_character_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── RELATIONS ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.relations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  universe_id UUID NOT NULL REFERENCES public.universes(id) ON DELETE CASCADE,
  entity_a_type TEXT NOT NULL,
  entity_a_id UUID NOT NULL,
  entity_b_type TEXT NOT NULL,
  entity_b_id UUID NOT NULL,
  relation_type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── MAP POINTS ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.map_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  universe_id UUID NOT NULL REFERENCES public.universes(id) ON DELETE CASCADE,
  location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  label TEXT NOT NULL,
  x_percent FLOAT NOT NULL,
  y_percent FLOAT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── LORE NOTES ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.lore_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  universe_id UUID NOT NULL REFERENCES public.universes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── UPDATED_AT TRIGGER ─────────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplica trigger de updated_at em todas as tabelas relevantes
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['universes','characters','locations','factions','events','creatures','religions','wars','lore_notes']
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS set_updated_at ON public.%I;
       CREATE TRIGGER set_updated_at
         BEFORE UPDATE ON public.%I
         FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();',
      t, t
    );
  END LOOP;
END;
$$;

-- ─── PERMISSÕES PARA SUPABASE DATA API ──────────────────────

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.universes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.characters TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.locations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.factions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.creatures TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.religions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wars TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lineages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.relations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.map_points TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lore_notes TO authenticated;

-- ─── ROW LEVEL SECURITY ─────────────────────────────────────

-- Habilita RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.universes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.factions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.religions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lineages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.map_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lore_notes ENABLE ROW LEVEL SECURITY;

-- Profiles: usuário só vê e edita o próprio
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;

CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Universes
DROP POLICY IF EXISTS "universes_select" ON public.universes;
DROP POLICY IF EXISTS "universes_insert" ON public.universes;
DROP POLICY IF EXISTS "universes_update" ON public.universes;
DROP POLICY IF EXISTS "universes_delete" ON public.universes;

CREATE POLICY "universes_select" ON public.universes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "universes_insert" ON public.universes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "universes_update" ON public.universes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "universes_delete" ON public.universes FOR DELETE USING (auth.uid() = user_id);

-- Helper: verifica se o usuário é dono do universo
CREATE OR REPLACE FUNCTION public.user_owns_universe(universe_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.universes
    WHERE id = universe_id AND user_id = auth.uid()
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Macro para gerar políticas de entidades filhas
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['characters','locations','factions','events','creatures','religions','wars','lineages','relations','map_points','lore_notes']
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS "%s_select" ON public.%I;
       DROP POLICY IF EXISTS "%s_insert" ON public.%I;
       DROP POLICY IF EXISTS "%s_update" ON public.%I;
       DROP POLICY IF EXISTS "%s_delete" ON public.%I;
       CREATE POLICY "%s_select" ON public.%I FOR SELECT USING (public.user_owns_universe(universe_id));
       CREATE POLICY "%s_insert" ON public.%I FOR INSERT WITH CHECK (public.user_owns_universe(universe_id));
       CREATE POLICY "%s_update" ON public.%I FOR UPDATE USING (public.user_owns_universe(universe_id));
       CREATE POLICY "%s_delete" ON public.%I FOR DELETE USING (public.user_owns_universe(universe_id));',
      t, t,
      t, t,
      t, t,
      t, t,
      t, t,
      t, t,
      t, t,
      t, t
    );
  END LOOP;
END;
$$;

-- ─── STORAGE BUCKET ─────────────────────────────────────────
-- Crie manualmente no painel: Storage → New bucket → "universe-covers" (public)
-- Ou execute este trecho se seu projeto permitir gerenciamento do storage via SQL:
INSERT INTO storage.buckets (id, name, public)
VALUES ('universe-covers', 'universe-covers', true)
ON CONFLICT (id) DO NOTHING;
