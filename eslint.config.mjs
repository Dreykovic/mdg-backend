import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import prettierPlugin from 'eslint-plugin-prettier'; // Assurez-vous que le plugin Prettier est bien importé
import prettierConfig from 'eslint-config-prettier';

export default [
  {
    files: ['src/**/*.{ts,js}'],
    ignores: ['dist/**', 'node_modules/**', 'logs/**', '*.js'], // Remplace .eslintignore
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      parser: typescriptParser, // TypeScript parser
    },
    plugins: {
      '@typescript-eslint': typescriptEslintPlugin, // Plugin TypeScript ESLint
      prettier: prettierPlugin, // Plugin Prettier
    },
    rules: {
      'prettier/prettier': ['error'], // Active Prettier comme règle ESLint
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: false,
        },
      ],
      '@typescript-eslint/no-explicit-any': 'off', // Vous pouvez modifier en "warn" si nécessaire
      'no-console': 'warn',
      'prefer-const': 'error',
      eqeqeq: ['error', 'always'],
      curly: 'error',
      'no-var': 'error',
      'prefer-arrow-callback': 'error',
      'object-shorthand': 'warn',
    },
  },
];
