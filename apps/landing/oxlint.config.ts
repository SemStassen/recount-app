import { defineConfig } from "oxlint";

import rootConfig from "../../oxlint.config.ts";

export default defineConfig({
  extends: [rootConfig],
  rules: {
    "unicorn/filename-case": "off",
  },
});
