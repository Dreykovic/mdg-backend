/**
 * Service to seed the database with default values and ensure the existence of a default user.
 * The functions here handle the creation or fetching of the default user and default units of measure.
 */
import config from '@/config';
import { PrismaClient } from '@prisma/client';
import colorTxt from 'ansi-colors';

import { log } from 'console';
import { seedDefaultUnits } from './unit.seeder';
import { createOrFindDefaultUser } from './user.seeder';

const prisma = new PrismaClient();

async function main() {
  if (config.isDev || config.isTest) {
    await seedDefaultUnits(prisma);
    await createOrFindDefaultUser(prisma);
  } else if (config.isStage) {
    log('Good update');
  }
}
main()
  .catch((e) => {
    log(colorTxt.red(`x Database seed error ${e}`));

    process.exit(1);
  })
  .finally(async () => {
    log(colorTxt.green(`✔ Database seed successfully `));

    await prisma.$disconnect();
  });
