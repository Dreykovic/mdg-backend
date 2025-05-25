// controllers/admin/InventoryController.ts
import { Service } from 'typedi';
import { Request, Response } from 'express';
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  UseMiddlewares,
  OverrideMiddlewares,
  NoMiddlewares,
} from '../../decorators/route.decorators';

@Service()
@Controller('/inventory', ['auth', 'rbac:ADMIN']) // Middlewares de controller
export class InventoryController {
  @Post('/')
  // Hérite: ['auth', 'rbac:ADMIN'] + validation
  async createInventory(req: Request, res: Response) {
    res.status(201).json({ message: 'Inventory created' });
  }

  @Get('/')
  @UseMiddlewares('cache:300') // Ajoute du cache en plus des middlewares du controller
  // Final: ['auth', 'rbac:ADMIN', 'cache:300']
  async listInventory(req: Request, res: Response) {
    res.json({ inventories: [] });
  }

  @Get('/public')
  @NoMiddlewares() // Aucun middleware, même pas ceux du controller
  // Final: []
  async getPublicInventory(req: Request, res: Response) {
    res.json({ public_inventories: [] });
  }

  @Get('/:id')
  // Hérite: ['auth', 'rbac:ADMIN']
  async getInventory(req: Request, res: Response) {
    const { id } = req.params;
    res.json({ inventory: { id } });
  }

  @Put('/:id')
  @UseMiddlewares('validateOwnership') // Ajoute une vérification de propriété
  // Final: ['auth', 'rbac:ADMIN', 'validateOwnership']
  async updateInventory(req: Request, res: Response) {
    const { id } = req.params;
    res.json({ message: `Inventory ${id} updated` });
  }

  @Delete('/:id')
  @OverrideMiddlewares('auth', 'rbac:SUPER_ADMIN', 'confirmDeletion')
  // Final: ['auth', 'rbac:SUPER_ADMIN', 'confirmDeletion'] (remplace complètement)
  async deleteInventory(req: Request, res: Response) {
    const { id } = req.params;
    res.json({ message: `Inventory ${id} deleted` });
  }

  @Patch('/bulk-update')
  @UseMiddlewares('rateLimit:10', 'validateBulkData')
  // Final: ['auth', 'rbac:ADMIN', 'rateLimit:10', 'validateBulkData']
  async bulkUpdate(req: Request, res: Response) {
    res.json({ message: 'Bulk update completed' });
  }
}

// controllers/admin/ProductController.ts
import { Service } from 'typedi';
import { Request, Response } from 'express';
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
} from '../../decorators/route.decorators';

@Service()
@Controller('/products') // Niveau controller
export class AdminProductController {
  @Post('/')
  async createProduct(req: Request, res: Response) {
    res.status(201).json({ message: 'Product created' });
  }

  @Get('/')
  async listProducts(req: Request, res: Response) {
    res.json({ products: [] });
  }

  @Get('/:id')
  async getProduct(req: Request, res: Response) {
    const { id } = req.params;
    res.json({ product: { id } });
  }

  @Put('/:id')
  async updateProduct(req: Request, res: Response) {
    const { id } = req.params;
    res.json({ message: `Product ${id} updated` });
  }

  @Patch('/:id/status')
  async updateProductStatus(req: Request, res: Response) {
    const { id } = req.params;
    res.json({ message: `Product ${id} status updated` });
  }
}

// controllers/ecommerce/ProductController.ts
import { Service } from 'typedi';
import { Request, Response } from 'express';
import {
  Controller,
  Get,
  Post,
  UseMiddlewares,
  OverrideMiddlewares,
  NoMiddlewares,
} from '../../decorators/route.decorators';

@Service()
@Controller('/products') // Pas de middlewares par défaut pour les produits publics
export class EcommerceProductController {
  @Get('/')
  @UseMiddlewares('cache:600', 'rateLimit:1000') // Cache + rate limiting pour liste publique
  // Final: ['cache:600', 'rateLimit:1000']
  async listPublicProducts(req: Request, res: Response) {
    res.json({ products: [] });
  }

  @Get('/:slug')
  @UseMiddlewares('cache:300') // Cache pour produit individuel
  // Final: ['cache:300']
  async getProductBySlug(req: Request, res: Response) {
    const { slug } = req.params;
    res.json({ product: { slug } });
  }

  @Get('/admin/all')
  @OverrideMiddlewares('auth', 'rbac:ADMIN') // Route admin dans controller public
  // Final: ['auth', 'rbac:ADMIN'] (remplace les middlewares du controller)
  async getAdminProducts(req: Request, res: Response) {
    res.json({ admin_products: [] });
  }

  @Get('/category/:categoryId')
  @UseMiddlewares('cache:300', 'validateCategory')
  // Final: ['cache:300', 'validateCategory']
  async getProductsByCategory(req: Request, res: Response) {
    const { categoryId } = req.params;
    res.json({ products: [], categoryId });
  }

  @Get('/search')
  @UseMiddlewares('rateLimit:100', 'sanitizeQuery')
  // Final: ['rateLimit:100', 'sanitizeQuery']
  async searchProducts(req: Request, res: Response) {
    const { q } = req.query;
    res.json({ products: [], query: q });
  }

  @Post('/:id/reviews')
  @OverrideMiddlewares('auth', 'rbac:USER', 'validatePurchase') // Seulement auth + validation achat
  // Final: ['auth', 'rbac:USER', 'validatePurchase']
  async createReview(req: Request, res: Response) {
    const { id } = req.params;
    res.status(201).json({ message: `Review created for product ${id}` });
  }

  @Get('/internal/stats')
  @NoMiddlewares() // Route interne sans middlewares (microservices)
  // Final: []
  async getInternalStats(req: Request, res: Response) {
    res.json({ stats: { total: 100 } });
  }
}

// controllers/ecommerce/AuthController.ts
import { Service } from 'typedi';
import { Request, Response } from 'express';
import {
  Controller,
  Post,
  UseMiddlewares,
} from '../../decorators/route.decorators';

@Service()
@Controller('/auth') // Niveau controller
export class AuthController {
  @Post('/login')
  @UseMiddlewares('rateLimit:5')
  async login(req: Request, res: Response) {
    res.json({ token: 'jwt-token', user: {} });
  }

  @Post('/register')
  @UseMiddlewares('rateLimit:3')
  async register(req: Request, res: Response) {
    res.status(201).json({ message: 'User registered', user: {} });
  }

  @Post('/refresh')
  @UseMiddlewares('auth')
  async refreshToken(req: Request, res: Response) {
    res.json({ token: 'new-jwt-token' });
  }

  @Post('/logout')
  @UseMiddlewares('auth')
  async logout(req: Request, res: Response) {
    res.json({ message: 'Logged out successfully' });
  }
}

// controllers/ecommerce/CartController.ts
import { Service } from 'typedi';
import { Request, Response } from 'express';
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  UseMiddlewares,
} from '../../decorators/route.decorators';

@Service()
@Controller('/cart') // Niveau controller
export class CartController {
  @Get('/')
  @UseMiddlewares('auth')
  async getCart(req: Request, res: Response) {
    res.json({ cart: { items: [] } });
  }

  @Post('/items')
  @UseMiddlewares('auth')
  async addItem(req: Request, res: Response) {
    res.status(201).json({ message: 'Item added to cart' });
  }

  @Put('/items/:itemId')
  @UseMiddlewares('auth')
  async updateItem(req: Request, res: Response) {
    const { itemId } = req.params;
    res.json({ message: `Cart item ${itemId} updated` });
  }

  @Delete('/items/:itemId')
  @UseMiddlewares('auth')
  async removeItem(req: Request, res: Response) {
    const { itemId } = req.params;
    res.json({ message: `Cart item ${itemId} removed` });
  }

  @Delete('/')
  @UseMiddlewares('auth')
  async clearCart(req: Request, res: Response) {
    res.json({ message: 'Cart cleared' });
  }
}
