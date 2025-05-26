import { Request, Response } from 'express';
import { Service } from 'typedi';
import { Controller, Get, Post } from '@/core/decorators/route.decorators';
import { log } from 'console';

@Service()
@Controller('/test')
export class TestController {
  @Get('/hello')
  async hello(req: Request, res: Response): Promise<void> {
    log('🎉 Route /hello appelée !');
    res.json({ message: 'Hello World!', timestamp: new Date().toISOString() });
  }

  @Post('/echo')
  async echo(req: Request, res: Response): Promise<void> {
    log('🎉 Route /echo appelée !');
    log('Body reçu:', req.body);
    res.json({
      message: 'Echo successful',
      data: req.body,
      timestamp: new Date().toISOString(),
    });
  }
}
