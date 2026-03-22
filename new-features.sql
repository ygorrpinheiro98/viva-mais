-- =============================================
-- NOVAS TABELAS PARA O VIVA+
-- =============================================

-- DESAFIOS
CREATE TABLE IF NOT EXISTS challenges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    challenge_type TEXT DEFAULT 'distance',
    target_value DECIMAL,
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS challenge_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    current_value DECIMAL DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(challenge_id, user_id)
);

-- GRUPOS
CREATE TABLE IF NOT EXISTS groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    group_type TEXT DEFAULT 'open',
    city TEXT,
    state TEXT,
    level TEXT DEFAULT 'all',
    sport TEXT DEFAULT 'both',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS group_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

-- EVENTOS
CREATE TABLE IF NOT EXISTS events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT,
    sport TEXT DEFAULT 'both',
    city TEXT,
    state TEXT,
    location TEXT,
    event_date TIMESTAMP WITH TIME ZONE,
    distance_km DECIMAL,
    url TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS event_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    confirmed BOOLEAN DEFAULT true,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- BLOG
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE,
    content TEXT,
    excerpt TEXT,
    cover_image TEXT,
    category TEXT,
    tags TEXT[],
    author_id UUID REFERENCES auth.users(id),
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PLANOS DE TREINO
CREATE TABLE IF NOT EXISTS workout_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    sport TEXT DEFAULT 'running',
    level TEXT,
    duration_weeks INTEGER,
    workouts_per_week INTEGER,
    content JSONB,
    is_premium BOOLEAN DEFAULT false,
    downloads INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RANKINGS (calculado automaticamente)
CREATE TABLE IF NOT EXISTS monthly_rankings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    month INTEGER,
    year INTEGER,
    total_distance DECIMAL DEFAULT 0,
    total_activities INTEGER DEFAULT 0,
    total_time INTEGER DEFAULT 0,
    rank INTEGER,
    UNIQUE(user_id, month, year)
);

-- Limpar RLS
ALTER TABLE challenges DISABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE group_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE workout_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_rankings DISABLE ROW LEVEL SECURITY;

-- =============================================
-- DADOS INICIAIS
-- =============================================

-- Desafio inicial
INSERT INTO challenges (title, description, challenge_type, target_value, start_date, end_date) VALUES
('Desafio Mensal de KM', 'Corra ou pedale mais de 100km este mês!', 'distance', 100, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days'),
('Desafio Semanal', 'Complete 5 atividades esta semana', 'activities', 5, CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days'),
('Desafio de Consistentência', 'Treine 10 dias seguidos', 'streak', 10, CURRENT_DATE, CURRENT_DATE + INTERVAL '14 days');

-- Grupos iniciais
INSERT INTO groups (name, description, city, state, sport, level) VALUES
('Corredores de São Paulo', 'Grupo para corredores da capital', 'São Paulo', 'SP', 'running', 'all'),
('Ciclistas do Interior', 'Pedaladores do interior de SP', 'Campinas', 'SP', 'cycling', 'all'),
('Trail Runners BR', 'Amantes de trilhas e corrida off-road', 'Rio de Janeiro', 'RJ', 'running', 'intermediate');

-- Eventos exemplo
INSERT INTO events (title, description, event_type, sport, city, state, event_date, distance_km) VALUES
('Maratona de São Paulo 2026', 'A maior corrida do Brasil', 'marathon', 'running', 'São Paulo', 'SP', '2026-06-15 06:00:00', 42.2),
('Gran Fondo Serra da Mantiqueira', 'Cicloturismo nas montanhas', 'gran_fondo', 'cycling', 'Campos do Jordão', 'SP', '2026-07-20 07:00:00', 120),
('Corrida dos 5K Weekend', 'Corrida de curta distância', '5k', 'running', 'Belo Horizonte', 'MG', '2026-04-05 07:00:00', 5);

-- Posts de blog iniciais
INSERT INTO blog_posts (title, slug, content, excerpt, category, is_published, published_at) VALUES
('Como começar na corrida', 'como-comecar-na-corrida', '<p>Quer começar a correr mas não sabe por onde? Neste guia completo mostramos tudo...</p>', 'Guia completo para iniciantes na corrida', 'training', true, NOW()),
('Escolha do tênis ideal', 'escolha-do-tenis-ideal', '<p>O tênis certo pode fazer toda diferença no seu desempenho...</p>', 'Como escolher o melhor tênis para seu tipo de pisada', 'gear', true, NOW()),
('Nutrição para corredores', 'nutricao-para-corredores', '<p>Alimentação é fundamental para performance...</p>', 'Dicas de nutrição para atletas', 'nutrition', true, NOW());

-- Planos de treino
INSERT INTO workout_plans (title, description, sport, level, duration_weeks, workouts_per_week, content) VALUES
('Iniciante 5K', 'Plano para quem está começando a correr', 'running', 'beginner', 8, 3, '{"week1": {"day1": "30min caminhada", "day3": "1min corre/2min anda x5", "day5": "30min caminhada"}}'),
('Intermediário 10K', 'Prepare-se para correr 10km', 'running', 'intermediate', 10, 4, '{"week1": {"day1": "5km ritmo fácil", "day3": "3x1km com 2min pausa", "day5": "6km ritmo constante"}}'),
('Ciclismo para iniciantes', 'Comece no ciclismo com segurança', 'cycling', 'beginner', 6, 3, '{"week1": {"day1": "20km terreno plano", "day3": "15km com colinas leves", "day5": "25km ritmo moderado"}}');
