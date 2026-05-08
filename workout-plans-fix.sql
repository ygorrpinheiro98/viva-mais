-- Adicionar colunas para planos de treino
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workout_plans' AND column_name = 'user_id') THEN
    ALTER TABLE workout_plans ADD COLUMN user_id UUID REFERENCES auth.users(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workout_plans' AND column_name = 'start_date') THEN
    ALTER TABLE workout_plans ADD COLUMN start_date DATE;
  END IF;
END $$;

-- Tornar workout_plans público para leitura
DROP POLICY IF EXISTS "workout_plans_public_read" ON workout_plans;
CREATE POLICY "workout_plans_public_read" ON workout_plans FOR SELECT USING (true);

DROP POLICY IF EXISTS "workout_plans_insert" ON workout_plans;
CREATE POLICY "workout_plans_insert" ON workout_plans FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "workout_plans_update" ON workout_plans;
CREATE POLICY "workout_plans_update" ON workout_plans FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "workout_plans_delete" ON workout_plans;
CREATE POLICY "workout_plans_delete" ON workout_plans FOR DELETE USING (auth.uid() = user_id);
