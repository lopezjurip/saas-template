import type { CodegenConfig } from "@graphql-codegen/cli";
import type { ClientPresetConfig } from "@graphql-codegen/client-preset";

const presetConfig: ClientPresetConfig = {
  fragmentMasking: false,
  gqlTagName: "gql",
};

const config: CodegenConfig = {
  schema: "../../packages/supabase/generated/graphql/graphql.schema.json",
  documents: ["./{app,components,hooks,lib}/**/*.{graphql,ts,tsx}"],
  ignoreNoDocuments: true,
  allowPartialOutputs: true,
  generates: {
    "./generated/graphql/": {
      preset: "client",
      presetConfig,
      config: {
        useTypeImports: true,
        strictScalars: true,
        skipTypename: true,
        documentMode: "string",
        dedupeFragments: true,
        enumType: "enum",
        scalars: {
          Int: "number",
          Float: "number",
          BigInt: "string",
          BigFloat: "string",
          Cursor: "string",
          Opaque: "string",
          Time: "string",
          Date: "string",
          Datetime: "string",
          JSON: "string",
          UUID: "string",
        },
      },
    },
  },
};

export default config;
