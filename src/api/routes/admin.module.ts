// app.ts
import { ModuleConfig } from '@/core/types/route.types';
import { goodsModuleController } from '../controllers/admin/goods';
import { compositionsModuleController } from '../controllers/admin/compositions';

// Configuration complète avec 4 niveaux de préfixage
const adminModule: ModuleConfig = {
  name: 'admin',
  prefix: '/admin', // Niveau 3: Module
  controllers: [...goodsModuleController, ...compositionsModuleController],
};

export default adminModule;
