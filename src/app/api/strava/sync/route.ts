import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;

async function refreshToken(refreshToken: string) {
  const response = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  return response.json();
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: "userId não fornecido" }, { status: 400 });
    }

    const supabase = await createClient();

    // Buscar conexão
    const { data: connection, error: connError } = await supabase
      .from("strava_connections")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (connError || !connection) {
      return NextResponse.json({ error: "Conexão Strava não encontrada" }, { status: 400 });
    }

    console.log("Connection found:", connection.athlete_id);

    let accessToken = connection.access_token;

    // Verificar se token expirou
    if (connection.expires_at && new Date(connection.expires_at) < new Date()) {
      console.log("Token expirado, renovando...");
      const newTokens = await refreshToken(connection.refresh_token);
      
      if (newTokens.access_token) {
        accessToken = newTokens.access_token;
        await supabase.from("strava_connections").update({
          access_token: newTokens.access_token,
          refresh_token: newTokens.refresh_token || connection.refresh_token,
          expires_at: new Date(newTokens.expires_at * 1000).toISOString(),
        }).eq("user_id", userId);
      }
    }

    console.log("Fetching activities with token...");

    // Buscar atividades do Strava
    const activitiesResponse = await fetch(
      "https://www.strava.com/api/v3/athlete/activities?per_page=50",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!activitiesResponse.ok) {
      const errorText = await activitiesResponse.text();
      console.error("Strava API error:", errorText);
      return NextResponse.json({ error: "Erro ao buscar atividades do Strava", details: errorText }, { status: 400 });
    }

    const stravaActivities = await activitiesResponse.json();
    
    console.log(`Found ${stravaActivities.length} activities from Strava`);

    if (!Array.isArray(stravaActivities) || stravaActivities.length === 0) {
      return NextResponse.json({ success: true, count: 0, message: "Nenhuma atividade no Strava" });
    }

    let insertedCount = 0;

    for (const activity of stravaActivities) {
      // Verificar se já existe
      const { data: existing } = await supabase
        .from("activities")
        .select("id")
        .eq("user_id", userId)
        .eq("strava_activity_id", activity.id)
        .single();

      if (!existing) {
        const { error: insertError } = await supabase.from("activities").insert({
          user_id: userId,
          strava_activity_id: activity.id,
          name: activity.name,
          activity_type: activity.type,
          distance_meters: activity.distance,
          moving_time_seconds: activity.moving_time,
          elapsed_time_seconds: activity.elapsed_time,
          total_elevation_gain: activity.total_elevation_gain,
          start_date: activity.start_date,
          average_speed: activity.average_speed,
          max_speed: activity.max_speed,
          average_heartrate: activity.average_heartrate,
          max_heartrate: activity.max_heartrate,
          calories: activity.calories,
          description: activity.description,
          import_source: "strava",
        });

        if (!insertError) {
          insertedCount++;
        } else {
          console.error("Insert error:", insertError);
        }
      }
    }

    console.log(`Inserted ${insertedCount} activities`);

    return NextResponse.json({ success: true, count: insertedCount });
  } catch (error: any) {
    console.error("Strava sync error:", error);
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 });
  }
}
