import { Controller, Get } from '@nestjs/common';

import { AppService } from '../services/app.service';
import { RateLimit } from '../../../../../../dist';

@Controller('points')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @RateLimit({
    points: 3,
    duration: 2,
    errorMessage: 'Accounts cannot be created more than once in per minute' })
  @Get()
  async getPoints() {
    return this.appService.getData();
  }

  @RateLimit({
    points: 1,
    pointsConsumed: 1,
    duration: 2,
    errorMessage: 'Accounts cannot be created more than once in per minute' })
  @Get('/consumed')
  async getPointsConsumed() {
    return this.appService.getData();
  }
}
