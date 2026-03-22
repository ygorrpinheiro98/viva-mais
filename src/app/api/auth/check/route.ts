import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    if (!supabase) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({ authenticated: true, userId: user.id });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
