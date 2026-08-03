import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{js,jsx}"],
    extends: [js.configs.recommended, reactHooks.configs.flat.recommended, reactRefresh.configs.vite],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    plugins: { react },
    rules: {
      // Cho ESLint biết `<Icon/>` trong JSX là "đã dùng" — nếu thiếu, core no-unused-vars
      // báo nhầm mọi component đã import. Trước đây chỗ này được né bằng
      // varsIgnorePattern '^[A-Z_]', nhưng cách đó vô hiệu hoá luôn việc phát hiện
      // component/hằng số thực sự thừa.
      "react/jsx-uses-vars": "error",
      "react/jsx-uses-react": "error",
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
  {
    // File shadcn/ui cố tình export thêm biến thể/helper cạnh component (buttonVariants,
    // useFormField…). Đây là quy ước chuẩn của shadcn → tắt cảnh báo fast-refresh ở đây.
    files: ["src/components/ui/**/*.{js,jsx}"],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
]);
