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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { data: activity } = await supabase
      .from("activities")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!activity) {
      return NextResponse.json({ error: "Atividade não encontrada" }, { status: 404 });
    }

    const { data: connection } = await supabase
      .from("strava_connections")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!connection) {
      return NextResponse.json({ error: "Conexão Strava não encontrada" }, { status: 400 });
    }

    let accessToken = connection.access_token;

    if (connection.expires_at && new Date(connection.expires_at) < new Date()) {
      const newTokens = await refreshToken(connection.refresh_token);
      if (newTokens.access_token) {
        accessToken = newTokens.access_token;
        await supabase.from("strava_connections").update({
          access_token: newTokens.access_token,
          refresh_token: newTokens.refresh_token || connection.refresh_token,
          expires_at: new Date(newTokens.expires_at * 1000).toISOString(),
        }).eq("user_id", user.id);
      }
    }

    const response = await fetch(
      `https://www.strava.com/api/v3/activities/${activity.strava_activity_id}?include_all_efforts=false`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!response.ok) {
      return NextResponse.json({ error: "Erro ao buscar detalhes do Strava" }, { status: 400 });
    }

    const details = await response.json();

    const {
      map,
      splits_metric,
      splits_standard,
      segment_efforts,
      photos,
      laps,
      ...rest
    } = details;

    return NextResponse.json({
      ...activity,
      strava_details: {
        splits_metric,
        splits_standard,
        segment_efforts: segment_efforts?.slice(0, 10),
        photos,
        laps,
      },
    });
  } catch (error: any) {
    console.error("Error fetching activity details:", error);
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 });
  }
}
