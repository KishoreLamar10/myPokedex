import { createServerSupabaseClient } from "@/lib/supabase/server";

const DEFAULT_PREFERENCES = {
  shinyIds: [] as number[],
  hiddenAbilityIds: [] as number[],
};

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id) {
      return Response.json(DEFAULT_PREFERENCES);
    }

    const { data } = await supabase
      .from("user_profiles")
      .select("shiny_ids, hidden_ability_ids")
      .eq("id", user.id)
      .single();

    return Response.json({
      shinyIds: (data?.shiny_ids as number[]) ?? [],
      hiddenAbilityIds: (data?.hidden_ability_ids as number[]) ?? [],
    });
  } catch {
    return Response.json(DEFAULT_PREFERENCES);
  }
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    shinyIds?: number[];
    hiddenAbilityIds?: number[];
  };

  const shinyIds = Array.isArray(body.shinyIds) ? body.shinyIds : [];
  const hiddenAbilityIds = Array.isArray(body.hiddenAbilityIds)
    ? body.hiddenAbilityIds
    : [];

  const { error } = await supabase.from("user_profiles").upsert({
    id: user.id,
    shiny_ids: shinyIds,
    hidden_ability_ids: hiddenAbilityIds,
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ shinyIds, hiddenAbilityIds });
}
