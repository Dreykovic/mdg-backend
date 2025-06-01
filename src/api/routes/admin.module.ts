// app.ts
import { ModuleConfig } from '@/core/types/route.types';
import { goodsModuleControllers } from '../controllers/admin/goods';
import { compositionsModuleControllers } from '../controllers/admin/compositions';
import { conversionModuleControllers } from '../controllers/admin/conversion';

// Configuration complète avec 4 niveaux de préfixage
const adminModule: ModuleConfig = {
  name: 'admin',
  prefix: '/admin', // Niveau 3: Module
  controllers: [
    ...goodsModuleControllers,
    ...compositionsModuleControllers,
    ...conversionModuleControllers,
  ],
};

export default adminModule;
