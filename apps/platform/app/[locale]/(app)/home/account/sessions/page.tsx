import { getSupabaseServerSession } from "@packages/supabase/client.server";
import { SUPABASE_JWT_DECODE_PAYLOAD } from "@packages/supabase/jwt";
import { gql } from "~/generated/graphql";
import { getGraphySession } from "~/lib/graphy/graphy.server";
import { SessionsSection, type SessionsSectionSessionFragmentType } from "./sessions-section";

const SessionsSectionPageQuery = gql(`
  query SessionsSectionPageQuery {
    viewer_sessions {
      edges {
        node {
          ...SessionsSectionSessionFragment
        }
      }
    }
  }
`);

export default async function SessionsPage(props: PageProps<"/[locale]/home/account/sessions">) {
  const { locale } = await props.params;
  const graphy = await getGraphySession();
  const { data } = await graphy.query({ query: SessionsSectionPageQuery });
  const serverSession = await getSupabaseServerSession();
  const payload = serverSession?.["access_token"] ? SUPABASE_JWT_DECODE_PAYLOAD(serverSession["access_token"]) : null;
  const sessions: SessionsSectionSessionFragmentType[] =
    data?.["viewer_sessions"]?.["edges"].map((edge) => edge["node"]) || [];

  return (
    <div className="flex max-w-180 flex-col gap-4.5">
      <header className="flex flex-col gap-1">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          Seguridad · Dispositivos
        </span>
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-foreground">Dispositivos y sesiones</h1>
        <p className="text-pretty text-sm/normal leading-normal text-muted-foreground">
          Todos los lugares donde tu cuenta tiene sesión abierta. Si ves algo que no reconoces, ciérralo aquí mismo.
        </p>
      </header>
      <SessionsSection sessions={sessions} currentSessionId={payload?.["session_id"]} />
    </div>
  );
}
