-- Tabela para treinos agendados
CREATE TABLE IF NOT EXISTS scheduled_workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('easy', 'tempo', 'interval', 'long', 'race', 'rest')),
  sport TEXT NOT NULL CHECK (sport IN ('run', 'bike', 'swim')),
  scheduled_date DATE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  tss INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_scheduled_workouts_user_date ON scheduled_workouts(user_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_scheduled_workouts_type ON scheduled_workouts(type);

-- Tabela para zonas de treino configuradas
CREATE TABLE IF NOT EXISTS training_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sport TEXT NOT NULL CHECK (sport IN ('run', 'bike')),
  system TEXT NOT NULL CHECK (system IN ('heart_rate', 'pace', 'power')),
  max_hr INTEGER,
  resting_hr INTEGER,
  threshold_hr INTEGER,
  threshold_pace INTEGER,
  ftp INTEGER,
  zones JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, sport)
);

-- Tabela para planos de treino do usuário
CREATE TABLE IF NOT EXISTS user_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id TEXT,
  title TEXT NOT NULL,
  phase TEXT CHECK (phase IN ('base', 'build', 'peak', 'recovery')),
  target_event TEXT,
  start_date DATE,
  end_date DATE,
  current_week INTEGER DEFAULT 1,
  total_weeks INTEGER DEFAULT 12,
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Políticas RLS
ALTER TABLE scheduled_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_plans ENABLE ROW LEVEL SECURITY;

-- Políticas para scheduled_workouts
CREATE POLICY "Users can view own scheduled workouts"
  ON scheduled_workouts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scheduled workouts"
  ON scheduled_workouts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scheduled workouts"
  ON scheduled_workouts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scheduled workouts"
  ON scheduled_workouts FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para training_zones
CREATE POLICY "Users can view own training zones"
  ON training_zones FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own training zones"
  ON training_zones FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own training zones"
  ON training_zones FOR UPDATE
  USING (auth.uid() = user_id);

-- Políticas para user_plans
CREATE POLICY "Users can view own plans"
  ON user_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plans"
  ON user_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plans"
  ON user_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own plans"
  ON user_plans FOR DELETE
  USING (auth.uid() = user_id);
