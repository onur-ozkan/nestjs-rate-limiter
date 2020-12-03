import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';
import { RateLimit } from '../../../../../dist';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @RateLimit({
    points: 1,
    pointsConsumed: 1,
    duration: 60,
    queueEnabled: true,
    errorMessage: 'Accounts cannot be created more than once in per minute' })
  @Get()
  async getData() {
    return this.appService.getData();
  }
}
