import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import react from "ultracite/oxlint/react";

export default defineConfig({
  ...core,
  env: {
    ...core.env,
    ...react.env,
  },
  ignorePatterns: [...(core.ignorePatterns ?? []), ".better-agents/**"],
  overrides: [...(core.overrides ?? []), ...(react.overrides ?? [])],
  plugins: [...new Set([...(core.plugins ?? []), ...(react.plugins ?? [])])],
  rules: {
    ...core.rules,
    ...react.rules,
    "func-style": [
      "error",
      "declaration",
      {
        allowArrowFunctions: true,
      },
    ],
    "eslint/func-names": [
      "error",
      "always",
      {
        generators: "never",
      },
    ],
    "eslint/max-classes-per-file": "off",
    "eslint/sort-keys": "off",
    "eslint/no-inline-comments": "off",
    "import/consistent-type-specifier-style": ["error", "prefer-top-level"],
    "import/namespace": "off",
    "typescript/array-type": [
      "error",
      {
        default: "generic",
        readonly: "generic",
      },
    ],
    "typescript/no-empty-interface": [
      "error",
      {
        allowSingleExtends: true,
      },
    ],
    "typescript/no-empty-object-type": [
      "error",
      {
        allowInterfaces: "with-single-extends",
      },
    ],
    "unicorn/no-useless-undefined": "off",
    "unicorn/no-array-method-this-argument": "off",
    "react-perf/jsx-no-new-function-as-prop": "off",
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: ["!~/domains/*", "~/domains/*/**"],
            message:
              "Import from the domain's public index.ts (e.g., ~/domains/workspace) instead of internal paths",
          },
        ],
      },
    ],
  },
  settings: {
    ...core.settings,
    ...react.settings,
  },
});
