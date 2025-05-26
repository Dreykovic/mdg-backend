/**
 * Complete ESLint Configuration for Node.js Express TypeScript Backend
 *
 * This configuration includes:
 * - TypeScript strict rules for API development
 * - Node.js/Express best practices and security
 * - Naming conventions enforcement
 * - Performance and code quality rules
 * - Prettier integration for consistent formatting
 *
 * @see https://eslint.org/docs/latest/use/configure/configuration-files
 * @see https://typescript-eslint.io/rules/
 */

import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import prettierPlugin from 'eslint-plugin-prettier';
import nodePlugin from 'eslint-plugin-n';

export default [
  {
    // Target files: TypeScript and JavaScript files in src directory
    files: ['src/**/*.{ts,js}'],

    // Files and directories to ignore during linting
    ignores: ['dist/**', 'node_modules/**', 'logs/**', 'coverage/**', '*.js'],

    // Language parsing options
    languageOptions: {
      ecmaVersion: 2022, // Support for latest ECMAScript features
      sourceType: 'module', // Use ES modules
      parser: typescriptParser, // TypeScript parser for better TS support
      parserOptions: {
        project: './tsconfig.json', // Path to TypeScript config for type information
        tsconfigRootDir: import.meta.dirname, // Root directory for tsconfig resolution
      },
      globals: {
        // Node.js global variables
        global: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        console: 'readonly',
      },
    },

    // ESLint plugins configuration
    plugins: {
      '@typescript-eslint': typescriptEslintPlugin, // TypeScript-specific rules
      prettier: prettierPlugin, // Prettier formatting integration
      node: nodePlugin, // Node.js specific rules (using eslint-plugin-n)
    },

    // Complete linting rules configuration
    rules: {
      // Prettier integration - treats formatting violations as ESLint errors
      'prettier/prettier': ['error'],

      // TypeScript naming conventions
      '@typescript-eslint/naming-convention': [
        'error',
        // Variables and functions in camelCase
        {
          selector: 'variable',
          format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
          leadingUnderscore: 'allow', // Allow _temp, _unused
          trailingUnderscore: 'forbid',
        },
        // Functions in camelCase
        {
          selector: 'function',
          format: ['camelCase'],
        },
        // Object properties in camelCase (allow snake_case for DB fields)
        {
          selector: 'property',
          format: ['camelCase', 'snake_case', 'UPPER_CASE'],
          leadingUnderscore: 'allow',
        },
        // Interfaces and Types in PascalCase
        {
          selector: 'interface',
          format: ['PascalCase'],
        },
        {
          selector: 'typeAlias',
          format: ['PascalCase'],
        },
        // Classes in PascalCase
        {
          selector: 'class',
          format: ['PascalCase'],
        },
        // Enums in PascalCase
        {
          selector: 'enum',
          format: ['PascalCase'],
        },
        // Enum members in UPPER_CASE
        {
          selector: 'enumMember',
          format: ['UPPER_CASE'],
        },
        // Parameters in camelCase (allow leading underscore for Express unused params)
        {
          selector: 'parameter',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },
        // Methods in camelCase
        {
          selector: 'method',
          format: ['camelCase'],
        },
      ],

      // TypeScript strict rules for backend APIs
      '@typescript-eslint/explicit-function-return-type': 'error', // Return types required for functions
      '@typescript-eslint/no-floating-promises': 'error', // Catch unhandled promises
      '@typescript-eslint/await-thenable': 'error', // Await only on promises
      '@typescript-eslint/no-misused-promises': 'error', // Proper promise usage in conditions
      '@typescript-eslint/prefer-nullish-coalescing': 'error', // Use ?? instead of ||
      '@typescript-eslint/prefer-optional-chain': 'error', // Use ?. for safe navigation
      '@typescript-eslint/strict-boolean-expressions': 'error', // Strict boolean contexts
      '@typescript-eslint/no-explicit-any': 'off', // Discourage any type in APIs
      // '@typescript-eslint/no-explicit-any': 'warn', // Discourage any type in APIs
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'after-used',
          argsIgnorePattern: '^_', // Allow _req, _res, _next in Express handlers
          varsIgnorePattern: '^_', // Allow _temp, _unused variables
          ignoreRestSiblings: false,
        },
      ],
      '@typescript-eslint/no-inferrable-types': 'error', // Avoid redundant type annotations
      '@typescript-eslint/prefer-readonly': 'warn', // Prefer readonly for class properties
      '@typescript-eslint/no-non-null-assertion': 'warn', // Discourage ! assertion operator

      // Core JavaScript security rules
      'no-eval': 'error', // Prevent code injection vulnerabilities
      'no-implied-eval': 'error', // Prevent setTimeout/setInterval with strings
      'no-new-func': 'error', // Prevent Function constructor usage
      'no-control-regex': 'error', // Disallow control characters in regular expressions
      'no-regex-spaces': 'error', // Disallow multiple spaces in regular expressions

      // Node.js specific security and best practices (eslint-plugin-n)
      'node/no-deprecated-api': 'error', // Disallow deprecated Node.js APIs
      'node/no-sync': 'error', // Prevent blocking synchronous file operations
      'node/handle-callback-err': 'error', // Always handle callback errors in Node.js
      'node/no-new-require': 'error', // Disallow new require
      'node/no-path-concat': 'error', // Use path.join() instead of string concatenation
      //  'node/no-process-exit': 'error', // Avoid abrupt process termination
      'node/no-unpublished-require': 'off', // Allow devDependencies in source
      'node/no-unsupported-features/es-syntax': 'off', // Allow modern ES syntax with TypeScript

      // Async/Promise best practices for backend
      'no-await-in-loop': 'error', // Prevent performance issues with sequential awaits
      'prefer-promise-reject-errors': 'error', // Always reject with Error objects
      'no-async-promise-executor': 'error', // Avoid async function in Promise constructor
      'no-return-await': 'error', // Unnecessary return await

      // General code quality rules
      'no-console': 'warn', // Use proper logging libraries instead of console
      'prefer-const': 'error', // Enforce immutability when possible
      eqeqeq: ['error', 'always'], // Require strict equality (=== and !==)
      curly: 'error', // Require curly braces for all control statements
      'no-var': 'error', // Disallow var declarations (use let/const)
      'prefer-arrow-callback': 'error', // Prefer arrow functions for callbacks
      'object-shorthand': 'warn', // Suggest object shorthand syntax
      'prefer-template': 'error', // Prefer template literals over string concatenation

      // Error prevention and code reliability
      'no-unreachable': 'error', // Detect unreachable code after return/throw
      'no-constant-condition': 'error', // Prevent conditions that are always true/false
      'no-duplicate-case': 'error', // Prevent duplicate cases in switch statements
      'no-empty': 'error', // Disallow empty block statements
      'no-extra-boolean-cast': 'error', // Prevent unnecessary double negation
      'valid-typeof': 'error', // Ensure valid typeof comparisons
      'consistent-return': 'error', // Require consistent return statements
      'default-case': 'error', // Require default case in switch statements
      'no-fallthrough': 'error', // Prevent unintentional fallthrough in switch
      'no-lonely-if': 'error', // Disallow if statements as only statement in else
      'no-unneeded-ternary': 'error', // Disallow unnecessary ternary expressions
      'no-else-return': 'error', // Disallow else blocks after return in if

      // Performance and maintainability
      complexity: ['warn', 20], // Limit cyclomatic complexity
      'max-depth': ['warn', 4], // Limit nesting depth
      'max-lines-per-function': ['warn', 100], // Limit function length
      'no-magic-numbers': [
        'off',
        {
          ignore: [
            0, 1, -1, 200, 201, 204, 400, 401, 403, 404, 422, 429, 500, 502,
            503,
          ], // Allow HTTP status codes
          ignoreArrayIndexes: true,
          ignoreDefaultValues: true,
        },
      ],

      // Import/Export best practices
      'no-duplicate-imports': 'error', // Prevent duplicate imports
      'sort-imports': [
        'error',
        {
          ignoreCase: true,
          ignoreDeclarationSort: true, // Let other tools handle declaration sorting
        },
      ],

      // Additional quality rules
      'no-nested-ternary': 'error', // Disallow nested ternary expressions
      'no-mixed-operators': 'error', // Require parentheses for mixed operators
      'no-multi-assign': 'error', // Disallow multiple assignments in single statement
      'prefer-object-spread': 'error', // Prefer object spread over Object.assign
      'prefer-destructuring': [
        'warn',
        {
          array: false,
          object: true,
        },
      ], // Encourage object destructuring
    },
  },

  // Specific configuration for test files
  {
    files: ['**/*.test.{ts,js}', '**/*.spec.{ts,js}', '**/tests/**/*.{ts,js}'],
    rules: {
      // Relaxed rules for test files
      'no-console': 'off', // Allow console.log in tests for debugging
      '@typescript-eslint/explicit-function-return-type': 'off', // Relaxed return types in tests
      'no-magic-numbers': 'off', // Allow test data numbers
      'max-lines-per-function': 'off', // Allow longer test functions
      '@typescript-eslint/no-explicit-any': 'off', // Allow any in test mocks
      'prefer-const': 'warn', // Relaxed const preference in tests
      'node/no-sync': 'off', // Allow sync operations in tests
    },
  },

  // Configuration for configuration files
  {
    files: ['*.config.{js,ts}', '**/*.config.{js,ts}'],
    rules: {
      'no-console': 'off', // Allow console in config files
      '@typescript-eslint/explicit-function-return-type': 'off', // Relaxed for config
      'no-magic-numbers': 'off', // Allow configuration numbers
      'node/no-process-exit': 'off', // Allow process.exit in config
    },
  },
];
