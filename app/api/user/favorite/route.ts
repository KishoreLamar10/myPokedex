import { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const DEFAULT_FAVORITE = 25;

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id) {
      return Response.json({ favoritePokemon: DEFAULT_FAVORITE });
    }

    const { data } = await supabase
      .from("user_profiles")
      .select("favorite_pokemon")
      .eq("id", user.id)
      .single();

    return Response.json({
      favoritePokemon: data?.favorite_pokemon ?? DEFAULT_FAVORITE,
    });
  } catch {
    return Response.json({ favoritePokemon: DEFAULT_FAVORITE });
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { favoritePokemon?: number };
  const favoritePokemon = Number(body.favoritePokemon);

  if (!Number.isFinite(favoritePokemon) || favoritePokemon < 1) {
    return Response.json({ error: "Invalid favoritePokemon" }, { status: 400 });
  }

  const { error } = await supabase.from("user_profiles").upsert({
    id: user.id,
    favorite_pokemon: favoritePokemon,
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ favoritePokemon });
}
