import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest', // Utiliser TypeScript avec Jest
  testEnvironment: 'node', // Définir l'environnement de test sur Node.js
  verbose: true, // Afficher des informations détaillées lors des tests

  // Extensions des fichiers de modules et des tests
  moduleFileExtensions: ['ts', 'tsx', 'js'],

  // Correspondance des fichiers de test à exécuter
  testMatch: ['**/tests/**/*.test.ts', '**/__tests__/**/*.test.ts'],

  // Résolution des alias de chemins
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@public/(.*)$': '<rootDir>/public/$1',
    '^@pri/(.*)$': '<rootDir>/prisma/$1',
    '^@docs/(.*)$': '<rootDir>/docs/$1',
    '^@logs/(.*)$': '<rootDir>/logs/$1',
    '^@packages$': '<rootDir>/package.json',
  },

  // Options de couverture de code
  collectCoverage: true, // Activer la collecte de la couverture
  coverageDirectory: 'coverage', // Dossier pour les rapports de couverture
  coverageReporters: ['json', 'lcov', 'text', 'clover'], // Formats des rapports de couverture
};

export default config;
