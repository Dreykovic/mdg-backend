/**
 * ESLint Configuration for Node.js Express TypeScript Backend
 *
 * Optimized for backend development with focus on:
 * - API security and reliability
 * - Async/await best practices
 * - TypeScript strict typing for APIs
 * - Express.js specific patterns
 */

import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
  {
    files: ['src/**/*.{ts,js}'],
    ignores: ['dist/**', 'node_modules/**', 'logs/**', '*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      parser: typescriptParser,
      globals: {
        // Node.js globals
        global: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslintPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      // Prettier integration
      'prettier/prettier': ['error'],

      // TypeScript strict rules for backend APIs
      '@typescript-eslint/explicit-function-return-type': 'error', // Return types required
      '@typescript-eslint/no-floating-promises': 'error', // Catch unhandled promises
      '@typescript-eslint/await-thenable': 'error', // Await only on promises
      '@typescript-eslint/no-misused-promises': 'error', // Proper promise usage
      '@typescript-eslint/prefer-nullish-coalescing': 'error', // Use ?? instead of ||
      '@typescript-eslint/prefer-optional-chain': 'error', // Use ?. for safe navigation
      '@typescript-eslint/strict-boolean-expressions': 'error', // Strict boolean contexts
      '@typescript-eslint/no-explicit-any': 'warn', // Avoid any in APIs
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'after-used',
          argsIgnorePattern: '^_', // Allow _req, _res, _next in Express handlers
          ignoreRestSiblings: false,
        },
      ],

      // Node.js backend security
      'no-eval': 'error', // Prevent code injection
      'no-implied-eval': 'error', // Prevent setTimeout/setInterval with strings
      'no-new-func': 'error', // Prevent Function constructor
      'no-process-exit': 'error', // Avoid abrupt process termination
      'no-sync': 'error', // Prevent blocking synchronous calls
      'no-buffer-constructor': 'error', // Use Buffer.from() instead of Buffer()
      'no-path-concat': 'error', // Use path.join() instead of string concat

      // Async/Promise best practices
      'no-await-in-loop': 'error', // Prevent performance issues
      'prefer-promise-reject-errors': 'error', // Reject with Error objects
      'no-async-promise-executor': 'error', // Avoid async in Promise constructor
      'handle-callback-err': 'error', // Always handle callback errors

      // Code quality and security
      'no-console': 'warn', // Use proper logging instead
      'prefer-const': 'error', // Immutability preference
      eqeqeq: ['error', 'always'], // Strict equality
      curly: 'error', // Always use braces
      'no-var': 'error', // Use let/const
      'prefer-arrow-callback': 'error', // Modern callback style
      'object-shorthand': 'warn', // Concise object syntax

      // Error prevention
      'no-unreachable': 'error', // Dead code detection
      'no-constant-condition': 'error', // Prevent infinite loops
      'no-duplicate-case': 'error', // Switch case duplicates
      'consistent-return': 'error', // Consistent function returns
      'default-case': 'error', // Switch default case
      'no-fallthrough': 'error', // Prevent accidental fallthrough

      // Performance and maintainability
      complexity: ['warn', 10], // Cyclomatic complexity limit
      'max-depth': ['warn', 4], // Nesting depth limit
      'no-magic-numbers': [
        'warn',
        {
          // Avoid magic numbers
          ignore: [0, 1, -1, 200, 201, 400, 401, 403, 404, 500], // HTTP status codes allowed
          ignoreArrayIndexes: true,
        },
      ],
    },
  },

  // Specific rules for test files
  {
    files: ['**/*.test.{ts,js}', '**/*.spec.{ts,js}'],
    rules: {
      'no-console': 'off', // Allow console in tests
      '@typescript-eslint/explicit-function-return-type': 'off', // Relaxed for tests
      'no-magic-numbers': 'off', // Allow test data numbers
    },
  },
];
