# Project Setup Guide

This document provides instructions for setting up and managing the project, including initialization, development, production, and database management.

---

## Prerequisites

Ensure you have the following installed on your system:

- **Node.js** (version 16 or later recommended)
- **npm** (Node Package Manager)
- **Prisma CLI**
- **TypeScript**

---

## Initialization

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-name>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Generate Prisma client:
   ```bash
   npm run pri:generate
   ```

4. Configure environment variables:
   - Copy the `.env.example` file to `.env`.
   - Update the `.env` file with your configuration (e.g., database URL, JWT secret, etc.).

---

## Development

To start the development server:

1. Run database migrations:
   ```bash
   npm run pri:dev:migrate
   ```

2. Seed the database (optional):
   ```bash
   npm run pri:seed
   ```

3. Start the development server with hot-reloading:
   ```bash
   npm run dev
   ```

4. Access Prisma Studio (database GUI):
   ```bash
   npm run pri:studio
   ```

---

## Production

### Build and Deploy

Run the following commands to build and prepare the project for production:

```bash
npm install && npm run pri:dev:reset && npm run pri:generate && npm run pri:prod:migrate && npm run set-env-prod && npm run build
```

### Start the Production Server

Start the project in production mode:

```bash
npm run start:prod
```

---

## Environment Variables


Ensure that the default user credentials and the database connection string are updated as required. The remaining configurations are optional.

---

## Testing

### Run All Tests

```bash
npm test
```

### Run Specific Tests

- Unit Tests:
  ```bash
  npm run test:unit
  ```
- Integration Tests:
  ```bash
  npm run test:integration
  ```
- End-to-End Tests:
  ```bash
  npm run test:e2e
  ```

### Watch Mode for Tests

```bash
npm run test:watch
```

---

## Linting and Formatting

### Lint Code

```bash
npm run lint
```

### Fix Linting Issues

```bash
npm run lint:fix
```

### Format Code

```bash
npm run format
```

---

## Database Management

### Development Migrations

```bash
npm run pri:dev:migrate
```

### Reset Database (Development)

```bash
npm run pri:dev:reset
```

### Push Schema to Database

```bash
npm run pri:db:push
```

### Validate Prisma Schema

```bash
npm run pri:validate
```

### Seed Database

```bash
npm run pri:seed
```

---

## Additional Commands

### Remove Build Artifacts

```bash
npm run clean
```

### Copy Assets to Build Directory

```bash
npm run assets
```

### Open Prisma Studio

```bash
npm run pri:studio
```

---

## Author
**Biréwa Audrey AMONA**  
Email: [amonaaudrey16a@gmail.com](mailto:amonaaudrey16a@gmail.com)  
GitHub: [Dreykovic](https://github.com/Dreykovic)