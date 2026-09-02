const js = require('@eslint/js');
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const prettierConfig = require('eslint-config-prettier');
const globals = require('globals');

module.exports = [
  // 1. Qué se ignora globalmente
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**'],
  },

  // 2. Reglas base de ESLint (JS puro)
  js.configs.recommended,

  // 3. Reglas TypeScript con linting "type-aware"
  //    (usa el tsconfig.json real para detectar errores basados en tipos,
  //    no solo en sintaxis)
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...tsPlugin.configs['recommended-type-checked'].rules,
      ...tsPlugin.configs['stylistic-type-checked'].rules,

      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',

      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },

  // 4. SIEMPRE al final: desactiva reglas de estilo que chocan con Prettier
  prettierConfig,
];
