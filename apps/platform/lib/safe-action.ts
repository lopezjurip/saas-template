import { createServerClient } from "@packages/supabase/client.server";
import { redirect } from "next/navigation";
import { createSafeActionClient } from "next-safe-action";

export const action = createSafeActionClient({
  defaultValidationErrorsShape: "flattened",
  handleServerError(e) {
    console.error("[safe-action]", e);
    return e instanceof Error ? e.message : "Error inesperado";
  },
});

// Inject the authenticated user + a fresh supabase server client into action context.
// Redirects to /auth if there is no session — the action's body never runs in that case.
export const authedAction = action.use(async ({ next }) => {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");
  return next({ ctx: { user, supabase } });
});

// Thin adapter so `<form action={...}>` can call a next-safe-action action that takes a typed object.
// `parse` pulls fields out of FormData; validation lives in the action's inputSchema.
export function formAction<TInput>(
  run: (input: TInput) => Promise<unknown>,
  parse: (formData: FormData) => TInput,
) {
  return async (formData: FormData) => {
    await run(parse(formData));
  };
}
