import { SupabaseClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Auth helpers — shared across all API routes
// ---------------------------------------------------------------------------

export interface CurrentUser {
  id: string; // auth.users.id
  memberId: string; // members.id
  role: string; // members.role
  email: string;
  name: string;
}

/**
 * Retrieve the currently authenticated user together with their member record.
 * Returns `null` when no valid session exists or no matching member row is found.
 */
export async function getCurrentUser(
  supabase: SupabaseClient,
): Promise<CurrentUser | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: member } = await supabase
    .from("members")
    .select("id, role, email, name")
    .eq("user_id", user.id)
    .single();

  if (!member) return null;

  return {
    id: user.id,
    memberId: member.id,
    role: member.role,
    email: member.email,
    name: member.name,
  };
}

/**
 * Check whether the current session belongs to an admin or super-admin.
 */
export async function isAdmin(supabase: SupabaseClient): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data: member } = await supabase
    .from("members")
    .select("role")
    .eq("user_id", user.id)
    .single();

  return member?.role === "admin" || member?.role === "super_admin";
}
