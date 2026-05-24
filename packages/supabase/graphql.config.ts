import path from "node:path";
import type { CodegenConfig } from "@graphql-codegen/cli";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(path.resolve(__dirname, "../../apps/platform"), true);

const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = process.env;

const href_graphql = `${NEXT_PUBLIC_SUPABASE_URL}/graphql/v1`;
const LOCAL = process.argv.includes("--local");

if (LOCAL) {
  console.log("[supabase/graphql.config.ts] using local schema JSON");
} else {
  console.log("[supabase/graphql.config.ts] loading schema from %s", href_graphql);
}

const schema: CodegenConfig["schema"] = LOCAL
  ? "./generated/graphql/graphql.schema.json"
  : [
      {
        [href_graphql]: {
          method: "POST",
          headers: { apiKey: NEXT_PUBLIC_SUPABASE_ANON_KEY } as Record<string, string>,
        },
      },
    ];

const config: CodegenConfig = {
  schema,
  generates: {
    "./generated/graphql/graphql.schema.json": {
      plugins: ["introspection"],
      config: {
        descriptions: true,
        schemaDescription: true,
      },
    },
    "./generated/graphql/graphql.schema.graphql": {
      plugins: ["schema-ast"],
      config: {
        includeDirectives: true,
        includeIntrospectionTypes: false,
        sort: true,
      },
    },
  },
};

export default config;
