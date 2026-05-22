import type { NextConfig } from "next";

const config: NextConfig = {
  transpilePackages: ["@packages/debug", "@packages/graphy", "@packages/ui-common"],
};

export default config;
