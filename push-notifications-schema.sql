-- =============================================
-- PUSH NOTIFICATIONS
-- =============================================

CREATE TABLE push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  notification_type TEXT DEFAULT 'all',
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "push_subscriptions_select" ON push_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "push_subscriptions_insert" ON push_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "push_subscriptions_update" ON push_subscriptions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "push_subscriptions_delete" ON push_subscriptions FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- NOTIFICATION PREFERENCES
-- =============================================

CREATE TABLE notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  workout_reminders BOOLEAN DEFAULT true,
  workout_reminder_time TIME DEFAULT '07:00',
  new_posts BOOLEAN DEFAULT true,
  new_comments BOOLEAN DEFAULT true,
  new_likes BOOLEAN DEFAULT true,
  challenge_updates BOOLEAN DEFAULT true,
  weekly_summary BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notification_preferences_select" ON notification_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notification_preferences_insert" ON notification_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notification_preferences_update" ON notification_preferences FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- SCHEDULED REMINDERS (para lembretes de treino)
-- =============================================

CREATE TABLE scheduled_reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE scheduled_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "scheduled_reminders_select" ON scheduled_reminders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "scheduled_reminders_insert" ON scheduled_reminders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "scheduled_reminders_update" ON scheduled_reminders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "scheduled_reminders_delete" ON scheduled_reminders FOR DELETE USING (auth.uid() = user_id);
