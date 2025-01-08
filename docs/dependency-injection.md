# Dependency Injection with TypeDI

## Introduction

Dependency Injection (DI) is a design pattern that allows for the decoupling of components in an application. TypeDI is a lightweight DI framework for TypeScript and JavaScript that helps manage dependencies using decorators and services.

This document elaborates on the implementation and usage of DI in a TypeScript project using TypeDI, including real-world examples.

---

## Configuration and Setup

### Installing TypeDI
To get started with TypeDI, install it using npm or yarn:
```bash
npm install typedi
```

### Enabling Decorators
Ensure that decorators are enabled in your `tsconfig.json`:
```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

---

## Defining a Service
Services are classes that encapsulate business logic or data access. TypeDI manages these services as singletons by default.

### Example: Defining a Service
Here is an example of a service handling Units of Measure (UOM):

```typescript
import { Service } from 'typedi';

@Service()
class UOMService {
  async getUOMList() {
    // Logic to fetch UOMs
    return [];
  }

  async createUOM(data: any) {
    // Logic to create a UOM
    return { id: 1, ...data };
  }
}
```

---

## Using Services in Controllers
Controllers handle HTTP requests and responses. By leveraging DI, you can inject services directly into controllers.

### Example: Injecting a Service into a Controller
The following example demonstrates how to use TypeDI to inject the `UOMService` into the `UOMController`:

```typescript
import { Request, Response } from 'express';
import { Service } from 'typedi';
import UOMService from './uOM.service';

@Service()
class UOMController {
  constructor(private uOMService: UOMService) {}

  async unitsOfMeasure(req: Request, res: Response): Promise<void> {
    try {
      const payload = await this.uOMService.getUOMList();
      res.status(200).json(payload);
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}
```

---

## Integrating with Express
To integrate TypeDI with an Express application, use the `typedi` container to resolve instances of controllers.

### Example: Registering Routes

```typescript
import express from 'express';
import Container from 'typedi';
import { UOMController } from './uOM.controller';

const uOMController = Container.get(UOMController);
const router = express.Router();

router.get('/uoms', (req, res) => uOMController.unitsOfMeasure(req, res));

export default router;
```

---

## Example Application Structure
Below is an example application structure showcasing the use of TypeDI:

```
/src
├── controllers
│   └── uOM.controller.ts
├── services
│   └── uOM.service.ts
├── routes
│   └── uOM.routes.ts
├── app.ts
└── index.ts
```

### Key Files
1. **`uOM.service.ts`**: Contains the logic for handling UOM operations.
2. **`uOM.controller.ts`**: Handles HTTP requests and delegates logic to the service.
3. **`uOM.routes.ts`**: Registers routes and binds them to controller methods.
4. **`app.ts`**: Configures middleware and initializes the application.

---

## Middleware and Initialization
### App Configuration
Here is an example of an Express application using TypeDI:

```typescript
import express from 'express';
import { Service } from 'typedi';
import uOMRoutes from './routes/uOM.routes';

@Service()
class App {
  public express: express.Application;

  constructor() {
    this.express = express();
    this.middleware();
    this.routes();
  }

  private middleware() {
    this.express.use(express.json());
  }

  private routes() {
    this.express.use('/api', uOMRoutes);
  }
}

export default App;
```

---

## Benefits of Using TypeDI
1. **Decoupled Components**: Promotes cleaner, testable, and maintainable code.
2. **Singleton Management**: Automatically handles singleton instances for services.
3. **Easy to Use**: Intuitive decorators simplify DI management.

---

## Conclusion
TypeDI streamlines dependency injection in TypeScript applications, especially when combined with frameworks like Express. By separating concerns and managing dependencies effectively, you can write scalable and maintainable applications.

