# Project Architecture Documentation

This document provides an overview of the project’s folder structure and describes the purpose of each file and directory. It serves as a reference for developers to understand the organization and responsibilities within the codebase.

---

## Root Directory Structure

```
.
├── arch.txt
├── docs
├── eslint.config.mjs
├── jest.config.ts
├── logs
├── nodemon.json
├── package.json
├── package-lock.json
├── src
├── storage
├── tests
└── tsconfig.json
```

### Root Files and Directories

- **arch.txt**: Contains a textual representation of the project’s architecture.
- **docs/**: Documentation files related to project setup and architecture.
- **eslint.config.mjs**: Configuration file for ESLint, specifying linting rules for the project.
- **jest.config.ts**: Configuration file for Jest, used for running and configuring tests.
- **logs/**: Stores application logs, including error and runtime logs.
- **nodemon.json**: Configuration file for Nodemon to enable hot-reloading during development.
- **package.json**: Contains metadata about the project and lists dependencies, scripts, and configurations.
- **package-lock.json**: Auto-generated file that locks the dependency versions installed.
- **src/**: The main source code of the project.
- **storage/**: Used for storing uploaded files or other persistent data.
- **tests/**: Contains test files for unit, integration, and end-to-end testing.
- **tsconfig.json**: Configuration file for TypeScript compiler options.

---

## `src/` Directory Structure

```
src/
├── config
├── core
├── database
├── index.ts
├── integrations
├── modules
├── public
├── server
└── views
```

### `src/config`

Contains configuration files for various project aspects:

- **cors.config.ts**: Manages CORS policies for handling cross-origin requests.
- **env.config.ts**: Handles environment variable configurations.
- **mail.config.ts**: Configures email services like SMTP.
- **multer.config.ts**: Sets up file upload configurations using Multer.
- **swagger.config.ts**: Configuration for Swagger documentation.
- **types.d.ts**: Contains global TypeScript type definitions.

### `src/core`

Houses core functionalities and utilities:

- **constants/**: Contains constant values used throughout the application.
  - **images.ts**: Defines constants related to image handling.
- **middlewares/**: Middleware functions for processing requests and responses.
  - Examples: JWT authentication, rate limiting, XSS prevention.
- **types/**: Shared TypeScript types.
- **utils/**: Utility functions for various operations (e.g., date handling, JWT operations, logging).

### `src/database`

Contains database-related files:

- **prisma/**: Directory for Prisma ORM files.
  - **migrations/**: Database migration files.
  - **schema.prisma**: Prisma schema defining the database structure.
  - **prisma.service.ts**: Service for managing database connections and queries.

### `src/integrations`

Contains integrations with external services:

- **nodemailer/**: Implementation for email functionality using Nodemailer.
- **postmark/**: Integration with the Postmark email service.

### `src/modules`

Feature-based modules that encapsulate specific functionalities:

- **adminAuth/**: Handles authentication and authorization for admins.
- **files/**: Manages file uploads and operations.
- **resources/**: Contains submodules like `uOM` for managing specific resources.

### `src/public`

Static files served by the application (e.g., images, stylesheets).

### `src/server`

Server-related files:

- **app.ts**: Main application file for initializing the server.
- **default.ts**: Default configurations for the server.
- **routes.ts**: Defines application routes.
- **server.ts**: Entry point for starting the server.
- **swaggerLoader.ts**: Configures Swagger for API documentation.

### `src/views`

Contains view templates for rendering content (e.g., email templates).

- **mail/**: Stores email templates.

---

## `tests/` Directory

Organized testing files:

- **e2e/**: End-to-end tests.
- **integration/**: Integration tests for testing module interactions.

---

This structure ensures modularity, scalability, and clarity, making the codebase easier to navigate and maintain. Each directory and file has a clear purpose to enhance collaboration and development efficiency.

