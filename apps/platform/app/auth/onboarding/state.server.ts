import "server-only";

import { createSupabaseServerClient } from "@packages/supabase/client.server";
import { redirect } from "next/navigation";
import { gql } from "~/generated/graphql";
import { getGraphySession } from "~/lib/graphy/graphy.server";
import { METHOD_ORDER, type OnboardingState } from "./state";

/**
 * Viewer's profile and its latest avatar in a single round-trip. The avatar nests through the
 * `storage_profiles` relationship on Profiles (RLS-scoped), so onboarding reads everything it
 * needs with one GraphQL call instead of separate profile + storage queries.
 */
const ViewerOnboardingStateGet = /*#__PURE__*/ gql(`
  query ViewerOnboardingStateGet {
    profile: viewerProfile {
      profileNameFull
      profileOnboardedAt
      avatar: storage_profiles(
        filter: { folder: { eq: "avatar" } }
        orderBy: [{ createdAt: DescNullsLast }]
        first: 1
      ) {
        edges {
          node {
            src
          }
        }
      }
    }
  }
`);

export async function getViewerOnboardingState(): Promise<OnboardingState> {
  const supabase = await createSupabaseServerClient();
  const { data: userResult } = await supabase.auth.getUser();
  const user = userResult.user;
  if (!user) {
    redirect("/auth");
  }

  const graphy = await getGraphySession();
  const [{ data: stateData }, { data: passkeyList }, { count: documentCount }] = await Promise.all([
    graphy.query({ query: ViewerOnboardingStateGet }),
    supabase.auth.passkey.list(),
    // Own identity documents only — the select RLS policy also exposes managed employees' rows,
    // so filter by profile_id to count just the viewer's.
    supabase
      .from("profile_identities")
      .select("profile_identity_id", { count: "exact", head: true })
      .eq("profile_id", user.id)
      .is("profile_identity_disabled_at", null),
  ]);

  const profile = stateData?.["profile"] ?? null;
  const avatarSrc = profile?.["avatar"]?.["edges"]?.[0]?.["node"]?.["src"] ?? null;

  const profile_name_full = profile?.["profileNameFull"] ?? "";
  const profile_avatar_src = avatarSrc ? new URL(avatarSrc, process.env["NEXT_PUBLIC_SUPABASE_URL"]!).toString() : null;
  const identities = user["identities"] ?? [];
  const hasPassword = identities.some((i) => i["provider"] === "email");
  const hasPasskey = (passkeyList?.length ?? 0) > 0;
  const hasEmail = Boolean(user["email_confirmed_at"]);
  const hasPhone = Boolean(user["phone_confirmed_at"]);
  const hasName = profile_name_full.trim().length >= 2;

  return {
    profile_id: user.id,
    email: user["email"] ?? null,
    phone: user["phone"] ?? null,
    profile_name_full,
    profile_onboarded_at: profile?.["profileOnboardedAt"] ?? null,
    profile_avatar_src,
    methods: {
      passkey: hasPasskey ? "done" : "pending",
      password: hasPassword ? "done" : "pending",
      phone: hasPhone ? "done" : "pending",
      email: hasEmail ? "done" : "pending",
      document: (documentCount ?? 0) > 0 ? "done" : "pending",
      profile: hasName ? "done" : "pending",
    },
  };
}

export function ASSERT_KNOWN_METHOD(id: string): id is (typeof METHOD_ORDER)[number] {
  return (METHOD_ORDER as readonly string[]).includes(id);
}
