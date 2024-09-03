module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  overrides: [
    {
      env: {
        node: true,
      },
      files: [".eslintrc.{js,cjs}"],
      parserOptions: {
        sourceType: "script",
      },
    },
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["react", "prettier", "@typescript-eslint"],
  rules: {
    "react/react-in-jsx-scope": "off",
    "prettier/prettier": "error",
    "react/prop-types": "off", // 타입스크립트를 사용하면 해결 될 문제이기 때문에 사용함
    // "no-undef": "off",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
