import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"] },
  { ignores: ["dist/**", "node_modules/**"] },
  { languageOptions: { globals: globals.node } },
  js.configs.recommended,
  ...tseslint.configs.recommended
];