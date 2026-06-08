import { defineConfig } from "oxlint";

import rootConfig from "../../oxlint.config.ts";

export default defineConfig({
  extends: [rootConfig],
  rules: {
    "oxc/no-barrel-file": "off",
    "unicorn/filename-case": [
      "error",
      {
        cases: {
          kebabCase: true,
        },
      },
    ],
  },
});
