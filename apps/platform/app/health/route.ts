import { NextResponse } from "next/server";
import { gql } from "~/generated/graphql";
import { createGraphy } from "~/lib/graphy/graphy.browser";

const HealthQuery = /*#__PURE__*/ gql(`
  query HealthQuery {
    health_current_timestamp
  }
`);

export async function GET() {
  try {
    const graphy = createGraphy();
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
