// app.ts
import { ModuleConfig } from '@/core/types/route.types';
import { AdminAuthController } from '../controllers/auth/admin_auth_controller';

import logger from '@/core/utils/logger.util';

logger.debug('🚀 === DÉBUT CONFIGURATION ROUTES ===');

// Configuration complète avec 4 niveaux de préfixage
const authModule: ModuleConfig = {
  name: 'auth',
  prefix: '/auth', // Niveau 3: Module
  controllers: [AdminAuthController],
};

export default authModule;
