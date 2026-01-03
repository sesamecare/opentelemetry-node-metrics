// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import importX from 'eslint-plugin-import-x';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  importX.flatConfigs.recommended,
  importX.flatConfigs.typescript,
  eslintConfigPrettier,
  {
    ignores: [
      'node_modules/**',
      'build/**',
      '*.js',
      '*.cjs',
      '*.mjs',
      '.yarn/**',
      'vitest.config.ts',
    ],
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      'import-x/resolver-next': [
        createTypeScriptImportResolver({
          alwaysTryTypes: true,
        }),
      ],
    },
    rules: {
      'import-x/prefer-default-export': 'off',
      'import-x/order': ['error', { 'newlines-between': 'always' }],
      'import-x/no-duplicates': 'error',
      'import-x/no-default-export': 'error',
      'no-param-reassign': ['error', { props: false }],
      'no-var': 'error',
      'prefer-const': 'error',
      quotes: ['error', 'single', { avoidEscape: true }],
    },
  },
);
