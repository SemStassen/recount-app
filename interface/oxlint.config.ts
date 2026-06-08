import { defineConfig } from "oxlint";

import rootConfig from "../oxlint.config.ts";

export default defineConfig({
  extends: [rootConfig],
  rules: {
    "eslint/no-use-before-define": "off",
    "import/no-relative-parent-imports": "off",
    "react/no-children-prop": "off",
  },
});
