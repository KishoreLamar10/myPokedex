import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    eventType?: string;
    payload?: Record<string, unknown>;
  };

  if (!body.eventType) {
    return Response.json({ error: "Missing eventType" }, { status: 400 });
  }

  const { error } = await supabase.from("analytics_events").insert({
    user_id: user.id,
    event_type: body.eventType,
    payload: body.payload ?? {},
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
