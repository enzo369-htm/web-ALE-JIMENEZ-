import { NextResponse } from "next/server";
import { createClient } from "../supabase/server";

export async function requireAuth(unauthorizedMessage = "Unauthorized") {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      supabase,
      user: null,
      errorResponse: NextResponse.json(
        { error: unauthorizedMessage },
        { status: 401 }
      ),
    };
  }

  return { supabase, user, errorResponse: null };
}
