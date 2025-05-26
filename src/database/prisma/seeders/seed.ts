/**
 * Service to seed the database with default values and ensure the existence of a default user.
 * The functions here handle the creation or fetching of the default user and default units of measure.
 */
import config from '@/config';
import { PrismaClient } from '@prisma/client';
import colorTxt from 'ansi-colors';

import { seedDefaultUnits } from './unit.seeder';
import { createOrFindDefaultUser } from './user.seeder';
import { seedDefaultWareHouse } from './warehouse.seeder';
import logger from '@/core/utils/logger.util';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  if (config.isDev || config.isTest) {
    await seedDefaultUnits(prisma);
    await createOrFindDefaultUser(prisma);
    await seedDefaultWareHouse(prisma);
  } else if (config.isStage) {
    logger.info('Good update');
  }
}
main()
  .catch((e) => {
    logger.error(colorTxt.red(`✗ Database seed error: ${e.message}`));
    logger.error(e.stack); // Pour le debug
    process.exit(1);
  })
  .finally(() => {
    logger.info(colorTxt.green(`✔ Database seed completed`));
    void prisma.$disconnect();
  });
