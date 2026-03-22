-- Verificar e criar tabelas se não existirem
DO $$
BEGIN
    -- Profiles
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'profiles') THEN
        CREATE TABLE profiles (
            id UUID PRIMARY KEY,
            full_name TEXT,
            bio TEXT,
            location TEXT,
            athlete_type TEXT DEFAULT 'runner',
            avatar_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
    
    -- Posts
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'posts') THEN
        CREATE TABLE posts (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL,
            content TEXT NOT NULL,
            post_type TEXT DEFAULT 'general',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
    
    -- Likes
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'likes') THEN
        CREATE TABLE likes (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL,
            post_id UUID NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, post_id)
        );
    END IF;
    
    -- Comments
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'comments') THEN
        CREATE TABLE comments (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL,
            post_id UUID NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
    
    -- Workouts
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'workouts') THEN
        CREATE TABLE workouts (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            workout_type TEXT DEFAULT 'cardio',
            duration_minutes INTEGER,
            distance_km DECIMAL,
            intensity TEXT DEFAULT 'medium',
            athlete_type TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
    
    -- Tips
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'tips') THEN
        CREATE TABLE tips (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            tip_type TEXT DEFAULT 'nutrition',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
    
    -- Strava Connections
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'strava_connections') THEN
        CREATE TABLE strava_connections (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL,
            athlete_id TEXT,
            access_token TEXT,
            refresh_token TEXT,
            expires_at TIMESTAMP,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
    
    -- Activities
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'activities') THEN
        CREATE TABLE activities (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL,
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
    END IF;
END $$;

-- Desabilitar e limpar RLS para simplificação
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE likes DISABLE ROW LEVEL SECURITY;
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE workouts DISABLE ROW LEVEL SECURITY;
ALTER TABLE tips DISABLE ROW LEVEL SECURITY;
ALTER TABLE strava_connections DISABLE ROW LEVEL SECURITY;
ALTER TABLE activities DISABLE ROW LEVEL SECURITY;

-- Inserir tips se tabela vazia
INSERT INTO tips (title, content, tip_type) 
SELECT 'Hidratação Antes do Treino', 'Beba 500ml de água 2 horas antes do exercício.', 'nutrition'
WHERE NOT EXISTS (SELECT 1 FROM tips WHERE title = 'Hidratação Antes do Treino');

INSERT INTO tips (title, content, tip_type) 
SELECT 'Carboidratos para Energia', 'Consuma carboidratos complexos antes de treinos longos.', 'nutrition'
WHERE NOT EXISTS (SELECT 1 FROM tips WHERE title = 'Carboidratos para Energia');
