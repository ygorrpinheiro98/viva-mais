-- =============================================
-- EVENTOS - Adicionar colunas faltantes
-- =============================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'event_type') THEN
    ALTER TABLE events ADD COLUMN event_type TEXT DEFAULT 'other';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'sport_type') THEN
    ALTER TABLE events ADD COLUMN sport_type TEXT DEFAULT 'both';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'start_date') THEN
    ALTER TABLE events ADD COLUMN start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'end_date') THEN
    ALTER TABLE events ADD COLUMN end_date TIMESTAMP WITH TIME ZONE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'location_name') THEN
    ALTER TABLE events ADD COLUMN location_name TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'latitude') THEN
    ALTER TABLE events ADD COLUMN latitude DECIMAL(10, 8);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'longitude') THEN
    ALTER TABLE events ADD COLUMN longitude DECIMAL(11, 8);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'distance') THEN
    ALTER TABLE events ADD COLUMN distance DECIMAL(10, 2);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'distance_unit') THEN
    ALTER TABLE events ADD COLUMN distance_unit TEXT DEFAULT 'km';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'price') THEN
    ALTER TABLE events ADD COLUMN price DECIMAL(10, 2);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'max_participants') THEN
    ALTER TABLE events ADD COLUMN max_participants INTEGER;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'organizer_name') THEN
    ALTER TABLE events ADD COLUMN organizer_name TEXT;
  END IF;
END $$;

-- Participantes de eventos
CREATE TABLE IF NOT EXISTS event_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'confirmed', 'cancelled', 'did_not_attend')),
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "event_participants_read" ON event_participants;
CREATE POLICY "event_participants_read" ON event_participants FOR SELECT USING (true);

DROP POLICY IF EXISTS "event_participants_insert" ON event_participants;
CREATE POLICY "event_participants_insert" ON event_participants FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "event_participants_update" ON event_participants;
CREATE POLICY "event_participants_update" ON event_participants FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "event_participants_delete" ON event_participants;
CREATE POLICY "event_participants_delete" ON event_participants FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- GRUPOS - Adicionar colunas faltantes
-- =============================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'groups' AND column_name = 'group_type') THEN
    ALTER TABLE groups ADD COLUMN group_type TEXT DEFAULT 'general';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'groups' AND column_name = 'region') THEN
    ALTER TABLE groups ADD COLUMN region TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'groups' AND column_name = 'cover_image_url') THEN
    ALTER TABLE groups ADD COLUMN cover_image_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'groups' AND column_name = 'avatar_url') THEN
    ALTER TABLE groups ADD COLUMN avatar_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'groups' AND column_name = 'is_public') THEN
    ALTER TABLE groups ADD COLUMN is_public BOOLEAN DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'groups' AND column_name = 'min_level') THEN
    ALTER TABLE groups ADD COLUMN min_level TEXT DEFAULT 'all';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'groups' AND column_name = 'max_members') THEN
    ALTER TABLE groups ADD COLUMN max_members INTEGER DEFAULT 100;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'groups' AND column_name = 'owner_id') THEN
    ALTER TABLE groups ADD COLUMN owner_id UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- Membros de grupos
CREATE TABLE IF NOT EXISTS group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'moderator', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "group_members_read" ON group_members;
CREATE POLICY "group_members_read" ON group_members FOR SELECT USING (true);

DROP POLICY IF EXISTS "group_members_join" ON group_members;
CREATE POLICY "group_members_join" ON group_members FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "group_members_leave" ON group_members;
CREATE POLICY "group_members_leave" ON group_members FOR DELETE USING (auth.uid() = user_id AND role != 'owner');

DROP POLICY IF EXISTS "group_members_update" ON group_members;
CREATE POLICY "group_members_update" ON group_members FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- ENCONTROS DE GRUPO
-- =============================================

CREATE TABLE IF NOT EXISTS group_meetings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  meeting_type TEXT DEFAULT 'training' CHECK (meeting_type IN ('training', 'social', 'competition', 'workshop', 'other')),
  sport_type TEXT DEFAULT 'running' CHECK (sport_type IN ('running', 'cycling', 'trail', 'swimming', 'triathlon', 'other')),
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  location_name TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  distance DECIMAL(10, 2),
  pace_min_km DECIMAL(5, 2),
  created_by UUID REFERENCES auth.users(id),
  max_participants INTEGER,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'cancelled', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE group_meetings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "group_meetings_public_read" ON group_meetings;
CREATE POLICY "group_meetings_public_read" ON group_meetings FOR SELECT USING (true);

DROP POLICY IF EXISTS "group_meetings_insert" ON group_meetings;
CREATE POLICY "group_meetings_insert" ON group_meetings FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "group_meetings_update" ON group_meetings;
CREATE POLICY "group_meetings_update" ON group_meetings FOR UPDATE USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "group_meetings_delete" ON group_meetings;
CREATE POLICY "group_meetings_delete" ON group_meetings FOR DELETE USING (auth.uid() = created_by);

-- Participantes de encontros
CREATE TABLE IF NOT EXISTS meeting_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID REFERENCES group_meetings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'going' CHECK (status IN ('going', 'maybe', 'not_going')),
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(meeting_id, user_id)
);

ALTER TABLE meeting_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "meeting_participants_read" ON meeting_participants;
CREATE POLICY "meeting_participants_read" ON meeting_participants FOR SELECT USING (true);

DROP POLICY IF EXISTS "meeting_participants_insert" ON meeting_participants;
CREATE POLICY "meeting_participants_insert" ON meeting_participants FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "meeting_participants_update" ON meeting_participants;
CREATE POLICY "meeting_participants_update" ON meeting_participants FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "meeting_participants_delete" ON meeting_participants;
CREATE POLICY "meeting_participants_delete" ON meeting_participants FOR DELETE USING (auth.uid() = user_id);
