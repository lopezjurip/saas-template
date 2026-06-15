import "server-only";

import { createSupabaseServerClient } from "@packages/supabase/client.server";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";
import { createSafeActionClient } from "next-safe-action";

export const action = createSafeActionClient({
  defaultValidationErrorsShape: "flattened",
  handleServerError(e) {
    if (isRedirectError(e)) throw e;
    console.error("[safe-action]", e);
    return e instanceof Error ? e.message : "Error inesperado";
  },
});

/**
 * Injects the authenticated user and a Supabase server client into the action context.
 * Redirects to `/auth` when there is no session, so the action body never runs unauthenticated.
 * @example
 * export const actionDoThing = authedAction.action(async ({ ctx }) => ctx.user);
 */
export const authedAction = action.use(async ({ next }) => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth");
  }
  return next({ ctx: { user, supabase } });
});

/**
 * Adapts a typed-input next-safe-action so it can be passed to `<form action={...}>`.
 * @example
 * <form action={formAction(actionSetEmail, (fd) => ({ email: fd.get("email") as string }))} />
 */
export function formAction<TInput>(run: (input: TInput) => Promise<unknown>, parse: (formData: FormData) => TInput) {
  return async (formData: FormData) => {
    await run(parse(formData));
  };
}
