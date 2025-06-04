import { Request, Response } from 'express';
import { Service } from 'typedi';
import { Controller, Get, Post } from '@/core/decorators/route.decorator';
import logger from '@/core/utils/logger.util';

@Service()
@Controller('')
export class TestController {
  @Get('/hello')
  async hello(req: Request, res: Response): Promise<void> {
    logger.debug('🎉 Route /hello appelée !');
    res.json({ message: 'Hello World!', timestamp: new Date().toISOString() });
  }

  @Post('/echo')
  async echo(req: Request, res: Response): Promise<void> {
    logger.debug('🎉 Route /echo appelée !');
    logger.debug('Body reçu:', req.body);
    res.json({
      message: 'Echo successful',
      data: req.body,
      timestamp: new Date().toISOString(),
    });
  }
}
