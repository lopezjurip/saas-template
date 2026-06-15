import { NextResponse } from "next/server";
import { gql } from "~/generated/graphql";
import { getGraphySession } from "~/lib/graphy/graphy.server";

const HealthQuery = /*#__PURE__*/ gql(`
  query HealthQuery {
    healthCurrentTimestamp
  }
`);

export async function GET(req: Request, ctx: RouteContext<"/health">) {
  try {
    const graphy = await getGraphySession();
    const { data, error } = await graphy.query({ query: HealthQuery });

    if (error) {
      return NextResponse.json({ ok: false, error: { message: error.message }, data }, { status: 502 });
    }

    return NextResponse.json({ ok: true, error: null, data });
  } catch (err: any) {
    console.error("[apps/tenant/app/health/route] error: %O", err);
    return NextResponse.json({ ok: false }, { status: 502 });
  }
}
