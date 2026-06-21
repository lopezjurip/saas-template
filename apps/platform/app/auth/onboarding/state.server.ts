import "server-only";

import { createSupabaseServerClient } from "@packages/supabase/client.server";
import { URL_NEW } from "@packages/utils/url";
import { redirect } from "next/navigation";
import { gql } from "~/generated/graphql";
import { getGraphySession } from "~/lib/graphy/graphy.server";
import { METHOD_ORDER, type OnboardingState } from "./state";

const NEXT_PUBLIC_SUPABASE_URL = process.env["NEXT_PUBLIC_SUPABASE_URL"]!;

const ViewerOnboardingStateGet = /*#__PURE__*/ gql(`
  query ViewerOnboardingStateGet($email: String!) {
    emailHasPassword(emailToCheck: $email)
    profile: viewerProfile {
      profileNameFull
      profileOnboardedAt
      identity: profileIdentity {
        profileIdentityId
      }
      avatar: profileStorageAvatar {
        src
      }
    }
  }
`);

export async function getViewerOnboardingState(): Promise<OnboardingState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth");
  }

  const graphy = await getGraphySession();
  const [{ data }, { data: passkeyList }] = await Promise.all([
    graphy.query({ query: ViewerOnboardingStateGet, variables: { email: user["email"] ?? "" } }),
    supabase.auth.passkey.list(),
  ]);

  const profile = data?.["profile"] ?? null;
  const avatarSrc = profile?.["avatar"]?.["src"] ?? null;

  const profile_name_full = profile ? profile["profileNameFull"] : null;
  const profile_avatar_src = avatarSrc ? URL_NEW(avatarSrc, NEXT_PUBLIC_SUPABASE_URL).href : null;
  const hasPassword = Boolean(data?.["emailHasPassword"]);
  const hasPasskey = passkeyList ? passkeyList.length > 0 : false;
  const hasEmail = Boolean(user["email_confirmed_at"]);
  const hasPhone = Boolean(user["phone_confirmed_at"]);
  const hasName = profile_name_full ? profile_name_full.trim().length >= 2 : false;

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
      document: profile?.["identity"] ? "done" : "pending",
      profile: hasName ? "done" : "pending",
    },
  };
}

export function ASSERT_KNOWN_METHOD(id: string): id is (typeof METHOD_ORDER)[number] {
  return (METHOD_ORDER as readonly string[]).includes(id);
}
