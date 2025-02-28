import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import unusedImports from "eslint-plugin-unused-imports";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import noRelativeImportPaths from "eslint-plugin-no-relative-import-paths";

import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", "src/api"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "unused-imports": unusedImports,
      "simple-import-sort": simpleImportSort,
      "no-relative-import-paths": noRelativeImportPaths,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "no-relative-import-paths/no-relative-import-paths": [
        "warn",
        { allowSameFolder: true , rootDir: "src", prefix: "@" },
      ],
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
);
