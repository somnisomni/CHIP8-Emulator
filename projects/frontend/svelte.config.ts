import type { Config } from "@sveltejs/kit";
import adapter from "@sveltejs/adapter-static";

const config: Config = {
  kit: {
    adapter: adapter(),
    alias: {
      "$": "./src",
    },
  },
  vitePlugin: {
    dynamicCompileOptions: ({ filename }) =>
      filename.includes("node_modules") ? undefined : { runes: true },
  },
};

export default config;
