import { PrismaService } from '@/database/prisma/prisma.service';

import { Service } from 'typedi';
@Service()
export default class ServiceDefinition {
  protected db;
  constructor(public readonly prismaService: PrismaService) {
    this.db = prismaService.getClient();
  }

  // Error handler for Prisma errors
  protected handleError(error: any) {
    return this.prismaService.handleError(error);
  }
}
