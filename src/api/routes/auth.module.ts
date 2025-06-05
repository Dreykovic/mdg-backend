// app.ts
import { ModuleConfig } from '@/core/types/route.types';
import { AdminAuthController } from '../controllers/admin/auth/admin-auth.controller';

// Configuration complète avec 4 niveaux de préfixage
const authModule: ModuleConfig = {
  name: 'auth',
  prefix: '/admin', // Niveau 3: Module
  controllers: [AdminAuthController],
};

export default authModule;
