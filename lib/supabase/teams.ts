import { createClient } from "./client";
import type { Team } from "@/types/team";

export async function fetchUserTeams(supabase: ReturnType<typeof createClient>, userId: string): Promise<Team[]> {
    const { data, error } = await supabase
        .from("teams")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []) as Team[];
}

export async function createTeam(supabase: ReturnType<typeof createClient>, userId: string, name: string): Promise<Team> {
    const { data, error } = await supabase
        .from("teams")
        .insert({ user_id: userId, name })
        .select()
        .single();

    if (error) throw error;
    return data as Team;
}

export async function updateTeam(supabase: ReturnType<typeof createClient>, teamId: string, updates: Partial<Team>): Promise<Team> {
    const { data, error } = await supabase
        .from("teams")
        .update(updates)
        .eq("id", teamId)
        .select()
        .single();

    if (error) throw error;
    return data as Team;
}

export async function deleteTeam(supabase: ReturnType<typeof createClient>, teamId: string): Promise<void> {
    const { error } = await supabase
        .from("teams")
        .delete()
        .eq("id", teamId);

    if (error) throw error;
}
