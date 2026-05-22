import type { NextConfig } from "next";

const config: NextConfig = {
  transpilePackages: ["@packages/ui-common", "@packages/supabase", "@packages/kapso", "@packages/react-email"],
};

export default config;
