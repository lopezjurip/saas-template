import type { NextConfig } from "next";

const config: NextConfig = {
  transpilePackages: ["@packages/debug", "@packages/graphy", "@packages/supabase", "@packages/ui-common"],
};

export default config;
