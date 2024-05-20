module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ["prettier", "eslint:recommended", "plugin:react/recommended"],
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
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["react", "prettier"],
  rules: {
    "react/react-in-jsx-scope": "off",
    "prettier/prettier": "error",
    "react/prop-types": "off", // 타입스크립트를 사용하면 해결 될 문제이기 때문에 사용함
  },
};
