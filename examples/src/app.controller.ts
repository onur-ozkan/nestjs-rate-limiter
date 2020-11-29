import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { RateLimit } from '../../dist';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @RateLimit({ points: 10, pointsConsumed: 10, duration: 60, queueEnabled: true, errorMessage: 'Get Hello cannot be called more than once in per minute' })
  @Get()
  async getHello(): Promise<string> {
    return this.appService.getHello();
  }
}
