-- =============================================
-- CORRIGIR POLÍTICAS RLS
-- =============================================

-- Limpar policies existentes
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_select" ON profiles;

DROP POLICY IF EXISTS "posts_select" ON posts;
DROP POLICY IF EXISTS "posts_insert" ON posts;
DROP POLICY IF EXISTS "posts_delete" ON posts;

DROP POLICY IF EXISTS "likes_select" ON likes;
DROP POLICY IF EXISTS "likes_insert" ON likes;
DROP POLICY IF EXISTS "likes_delete" ON likes;

DROP POLICY IF EXISTS "comments_select" ON comments;
DROP POLICY IF EXISTS "comments_insert" ON comments;
DROP POLICY IF EXISTS "comments_delete" ON comments;

DROP POLICY IF EXISTS "workouts_select" ON workouts;
DROP POLICY IF EXISTS "workouts_insert" ON workouts;
DROP POLICY IF EXISTS "workouts_update" ON workouts;
DROP POLICY IF EXISTS "workouts_delete" ON workouts;

DROP POLICY IF EXISTS "tips_select" ON tips;

DROP POLICY IF EXISTS "strava_select" ON strava_connections;
DROP POLICY IF EXISTS "strava_insert" ON strava_connections;
DROP POLICY IF EXISTS "strava_update" ON strava_connections;
DROP POLICY IF EXISTS "strava_delete" ON strava_connections;

DROP POLICY IF EXISTS "activities_select" ON activities;
DROP POLICY IF EXISTS "activities_insert" ON activities;
DROP POLICY IF EXISTS "activities_delete" ON activities;

-- Recriar policies mais permissivas para desenvolvimento
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_public_read" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_all" ON profiles FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "posts_public_read" ON posts FOR SELECT USING (true);
CREATE POLICY "posts_all" ON posts FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "likes_public_read" ON likes FOR SELECT USING (true);
CREATE POLICY "likes_all" ON likes FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "comments_public_read" ON comments FOR SELECT USING (true);
CREATE POLICY "comments_all" ON comments FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "workouts_public_read" ON workouts FOR SELECT USING (true);
CREATE POLICY "workouts_all" ON workouts FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE tips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tips_public_read" ON tips FOR SELECT USING (true);
CREATE POLICY "tips_all" ON tips FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE strava_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "strava_public_read" ON strava_connections FOR SELECT USING (true);
CREATE POLICY "strava_all" ON strava_connections FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "activities_public_read" ON activities FOR SELECT USING (true);
CREATE POLICY "activities_all" ON activities FOR ALL USING (true) WITH CHECK (true);
