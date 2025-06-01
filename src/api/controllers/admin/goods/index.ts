import { CategoryController } from './category.controller';
import { MarginController } from './margin.controller';
import { OriginController } from './origin.controller';
import { ProductTagLinkController } from './product-tag-link.controller';
import { ProductTagController } from './product-tag.controller';
import { ProductController } from './product.controller';
import SupplierController from './supplier.controller';

export const goodsModuleControllers = [
  CategoryController,
  MarginController,
  OriginController,
  SupplierController,
  ProductTagController,
  ProductController,
  ProductTagLinkController,
];
