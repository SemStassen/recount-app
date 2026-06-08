import { defineConfig } from "oxlint";
import base from "../../oxlint.config.ts";

export default defineConfig({
  ...base,
  rules: {
    ...base.rules,
    "eslint/no-use-before-define": "off",
  },
});
