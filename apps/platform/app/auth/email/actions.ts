"use server";
import "server-only";

import { redirect } from "next/navigation";
import { z } from "zod";
import { gql } from "~/generated/graphql";
import { AUTH_EXPOSE_ACCOUNT_EXISTENCE } from "~/lib/constants";
import { getGraphySession } from "~/lib/graphy/graphy.server";
import { action, formAction } from "~/lib/safe-action.server";

const checkEmailSchema = z.object({
  email: z
    .string()
    .min(1)
    .transform((v) => v.trim().toLowerCase()),
  next: z.string().default("/auth/router"),
});

const CheckEmailQuery = gql(`
  query CheckEmailQuery($email: String!) {
    emailDomainHasSso(emailInput: $email)
    emailExists(emailToCheck: $email)
    emailHasPassword(emailToCheck: $email)
  }
`);

/**
 * Step-1 → step-2 dispatcher. Resolves availability flags then redirects to the same
 * /auth/email route with `value=` + flags so the page renders the method picker.
 */
const checkEmailRun = action.inputSchema(checkEmailSchema).action(async ({ parsedInput }) => {
  const email = parsedInput["email"];
  const next = parsedInput["next"];

  if (!email.includes("@")) {
    redirect(`/auth/email?error=invalid_email&next=${encodeURIComponent(next)}`);
  }

  const graphy = await getGraphySession();
  const { data } = await graphy.query({ query: CheckEmailQuery, variables: { email } });

  const ssoProviderId = data?.["emailDomainHasSso"];
  if (ssoProviderId) {
    const domain = email.split("@")[1] ?? "";
    const qs = new URLSearchParams({ value: email, has_sso: "1", sso_domain: domain, next });
    redirect(`/auth/email?${qs.toString()}`);
  }

  if (!AUTH_EXPOSE_ACCOUNT_EXISTENCE) {
    const qs = new URLSearchParams({ value: email, next });
    redirect(`/auth/email?${qs.toString()}`);
  }

  const exists = data?.["emailExists"];
  if (!exists) {
    const qs = new URLSearchParams({ value: email, exists: "0", next });
    redirect(`/auth/email?${qs.toString()}`);
  }

  const hasPassword = data?.["emailHasPassword"];
  const qs = new URLSearchParams({
    value: email,
    exists: "1",
    has_password: hasPassword ? "1" : "0",
    next,
  });
  redirect(`/auth/email?${qs.toString()}`);
});

export const checkEmail = formAction(checkEmailRun, (fd) => ({
  email: String(fd.get("email") ?? ""),
  next: String(fd.get("next") ?? "/auth/router"),
}));
