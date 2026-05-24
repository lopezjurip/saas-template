import type { IGraphQLConfig } from "graphql-config";

const config: IGraphQLConfig = {
  projects: {
    platform: {
      schema: "packages/supabase/generated/graphql/graphql.schema.json",
      documents: ["apps/platform/{app,components,hooks,lib}/**/*.{graphql,ts,tsx}"],
    },
  },
};

export default config;
