// app.ts
import { ModuleConfig } from '@/core/types/route.types';
import { CategoryController } from '../controllers/admin/goods/category.controller';
import { MarginController } from '../controllers/admin/goods/margin.controller';
import { OriginController } from '../controllers/admin/goods/origin.controller';
import SupplierController from '../controllers/admin/goods/supplier.controller';
import { ProductTagController } from '../controllers/admin/goods/product-tag.controller';

// Configuration complète avec 4 niveaux de préfixage
const adminModule: ModuleConfig = {
  name: 'admin',
  prefix: '/admin', // Niveau 3: Module
  controllers: [
    CategoryController,
    MarginController,
    OriginController,
    SupplierController,
    ProductTagController,
  ],
};

export default adminModule;
