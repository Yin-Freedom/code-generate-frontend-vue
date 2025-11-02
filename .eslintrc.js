// ESLint configuration file
// Documentation: https://eslint.org/docs/user-guide/configuring
module.exports = {
  // Define this as the root configuration file
  root: true,
  // Specify environments that define global variables
  env: {
    node: true,
    browser: true,
    es2021: true,
  },
  // Parser configuration for Vue files
  parser: 'vue-eslint-parser',
  // Parser options
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  plugins: ['vue'],
  // Extend configurations from other configs
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-essential',
    'plugin:vue/vue3-recommended',
    '@vue/typescript/recommended',
    'plugin:prettier/recommended',
  ],
  // Custom rules
  rules: {
    // Disable indent rule (handled by prettier)
    indent: 'off',
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    // Vue specific rules
    'vue/multi-word-component-names': 'off',
    // Disable trailing comma rules
    'comma-dangle': 'off',
    '@typescript-eslint/comma-dangle': 'off',
  },
  // Files and directories to ignore
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'public/',
    '*.min.js',
    'webpack.*.js',
    'webpack.config.js',
  ],
};
