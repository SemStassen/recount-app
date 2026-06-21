import { defineConfig } from "oxfmt";
import ultraciteCoreConfig from "ultracite/oxfmt";

export default defineConfig({
  extends: [ultraciteCoreConfig],
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: false,
  quoteProps: "as-needed",
  jsxSingleQuote: false,
  trailingComma: "es5",
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: "always",
  endOfLine: "lf",
  experimentalSortPackageJson: false,
  experimentalSortImports: {
    ignoreCase: true,
    newlinesBetween: true,
    order: "asc",
  },
});
