import { defineConfig, globalIgnores } from "eslint/config";

const eslintConfig = defineConfig([
  globalIgnores([
    "dist/**",
    "build/**",
    "coverage/**",
    "api-server/**",
    "__mocks__/**",
    "src/components/ui/map.tsx",
  ]),
]);

export default eslintConfig;
