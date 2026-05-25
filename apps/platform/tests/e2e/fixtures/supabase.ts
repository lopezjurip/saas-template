import { createServiceRoleClient } from "@packages/supabase/client.service";

export const supabaseAdmin = createServiceRoleClient();

/**
 * Provision an auth.users row with `email_confirm: true` so the test can sign in
 * immediately without round-tripping through Inbucket. The `users_handle_created`
 * trigger inserts the matching public.profiles row.
 */
export async function CREATE_CONFIRMED_USER(email: string, password: string, fullName: string) {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (error || !data.user) {
    throw new Error(`failed to create test user ${email}: ${error?.message}`);
  }
  return data.user;
}

export async function DELETE_USER_BY_EMAIL(email: string) {
  const { data: list } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
  const user = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (!user) return;
  await supabaseAdmin.auth.admin.deleteUser(user.id);
}

/** Delete a tenant + its cascading rows (organizations, memberships, grants). */
export async function DELETE_TENANT_BY_SLUG(slug: string) {
  await supabaseAdmin.from("tenants").delete().eq("tenant_slug", slug);
}
