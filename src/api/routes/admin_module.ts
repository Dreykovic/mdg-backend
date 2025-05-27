// app.ts
import { ModuleConfig } from '@/core/types/route.types';
import { CategoryController } from '../controllers/admin/goods/category_controller';

// Configuration complète avec 4 niveaux de préfixage
const adminModule: ModuleConfig = {
  name: 'admin',
  prefix: '/admin', // Niveau 3: Module
  controllers: [CategoryController],
};

export default adminModule;
