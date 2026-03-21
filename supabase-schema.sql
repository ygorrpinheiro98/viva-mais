-- =============================================
-- LIMPAR TABELAS EXISTENTES (se necessário)
-- =============================================

DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS strava_connections CASCADE;
DROP TABLE IF EXISTS tips CASCADE;
DROP TABLE IF EXISTS workouts CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS likes CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- =============================================
-- TABELAS PRINCIPAIS
-- =============================================

-- Criar tabela de perfis
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  bio TEXT,
  location TEXT,
  athlete_type TEXT DEFAULT 'runner',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- =============================================
-- FEED / COMUNIDADE
-- =============================================

CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  post_type TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "posts_select" ON posts FOR SELECT USING (true);
CREATE POLICY "posts_insert" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "posts_delete" ON posts FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "likes_select" ON likes FOR SELECT USING (true);
CREATE POLICY "likes_insert" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "likes_delete" ON likes FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comments_select" ON comments FOR SELECT USING (true);
CREATE POLICY "comments_insert" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_delete" ON comments FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- TREINOS & NUTRIÇÃO
-- =============================================

CREATE TABLE workouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  workout_type TEXT DEFAULT 'cardio',
  duration_minutes INTEGER,
  distance_km DECIMAL,
  intensity TEXT DEFAULT 'medium',
  athlete_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workouts_select" ON workouts FOR SELECT USING (true);
CREATE POLICY "workouts_insert" ON workouts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "workouts_update" ON workouts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "workouts_delete" ON workouts FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE tips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tip_type TEXT DEFAULT 'nutrition',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE tips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tips_select" ON tips FOR SELECT USING (true);

-- =============================================
-- STRAVA INTEGRATION
-- =============================================

CREATE TABLE strava_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  athlete_id TEXT,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE strava_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "strava_select" ON strava_connections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "strava_insert" ON strava_connections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "strava_update" ON strava_connections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "strava_delete" ON strava_connections FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  strava_activity_id BIGINT,
  name TEXT,
  activity_type TEXT,
  distance_meters DECIMAL,
  moving_time_seconds INTEGER,
  elapsed_time_seconds INTEGER,
  total_elevation_gain DECIMAL,
  start_date TIMESTAMP WITH TIME ZONE,
  average_speed DECIMAL,
  max_speed DECIMAL,
  average_heartrate DECIMAL,
  max_heartrate DECIMAL,
  calories DECIMAL,
  description TEXT,
  import_source TEXT DEFAULT 'strava',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activities_select" ON activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "activities_insert" ON activities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "activities_delete" ON activities FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- DADOS INICIAIS
-- =============================================

INSERT INTO tips (title, content, tip_type) VALUES
('Hidratação Antes do Treino', 'Beba 500ml de água 2 horas antes do exercício para garantir boa hidratação.', 'nutrition'),
('Carboidratos para Energia', 'Consuma carboidratos complexos como arroz integral e aveia antes de treinos longos.', 'nutrition'),
('Recuperação com Proteína', 'Após o treino, consuma proteína em 30 minutos para auxiliar na recuperação muscular.', 'nutrition'),
('Alongamento Pós-Treino', 'Alongue-se por pelo menos 10 minutos após o exercício para melhorar a flexibilidade.', 'health'),
('Descanso é Fundamental', 'Dormir 7-9 horas é essencial para a recuperação e performance esportiva.', 'health'),
('Aquecimento Importante', 'Faça 5-10 minutos de aquecimento dinâmico antes de iniciar o treino principal.', 'training'),
('Progressão Gradual', 'Aumente a intensidade e duração do treino em no máximo 10% por semana.', 'training'),
('Alongamento de Panturrilha', 'Alongue a panturrilha por 30 segundos cada perna para prevenir câimbras.', 'health');
