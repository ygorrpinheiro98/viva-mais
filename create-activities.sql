-- Recriar tabela activities
CREATE TABLE public.activities (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid,
    strava_activity_id bigint,
    name text,
    activity_type text,
    distance_meters numeric,
    moving_time_seconds integer,
    elapsed_time_seconds integer,
    total_elevation_gain numeric,
    start_date timestamp with time zone,
    average_speed numeric,
    max_speed numeric,
    average_heartrate numeric,
    max_heartrate numeric,
    calories numeric,
    description text,
    import_source text DEFAULT 'strava'::text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT activities_pkey PRIMARY KEY (id)
);

-- Desabilitar RLS
ALTER TABLE activities DISABLE ROW LEVEL SECURITY;
