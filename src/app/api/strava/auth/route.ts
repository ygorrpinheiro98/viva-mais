import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET) {
      return NextResponse.json({ error: "Strava não configurado" }, { status: 500 });
    }

    const redirectUri = `${request.nextUrl.origin}/dashboard/strava/callback`;

    const tokenResponse = await fetch("https://www.strava.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: STRAVA_CLIENT_ID,
        client_secret: STRAVA_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      return NextResponse.json({ error: "Erro ao trocar código" }, { status: 400 });
    }

    const tokenData = await tokenResponse.json();

    const athleteResponse = await fetch("https://www.strava.com/api/v3/athlete", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const athlete = await athleteResponse.json();

    await supabase.from("strava_connections").upsert({
      user_id: user.id,
      athlete_id: athlete.id?.toString(),
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: new Date(tokenData.expires_at * 1000).toISOString(),
    });

    return NextResponse.json({ success: true, athlete_id: athlete.id });
  } catch (error) {
    console.error("Strava auth error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
