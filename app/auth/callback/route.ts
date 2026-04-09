import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // if "next" is in search params, use it as the redirection URL
  const next = searchParams.get("next") ?? "/";
  const error_description = searchParams.get("error_description");

  console.log("Auth Callback triggered:", { code: !!code, next, error_description });

  if (error_description) {
    console.error("Auth Callback error link:", error_description);
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error_description=${encodeURIComponent(error_description)}`);
  }

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error("Exchange code error:", error.message);
      return NextResponse.redirect(`${origin}/auth/auth-code-error?error_description=${encodeURIComponent(error.message)}`);
    }

    const { data: { session } } = await supabase.auth.getSession();
    console.log("Exchange successful. Session established:", !!session);
    
    console.log("Redirecting to:", next);
    return NextResponse.redirect(`${origin}${next}`);
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
