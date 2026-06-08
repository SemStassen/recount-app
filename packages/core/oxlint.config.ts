import { defineConfig } from "oxlint";
import base from "../../oxlint.config.ts";

export default defineConfig({
  ...base,
  rules: {
    ...base.rules,
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
