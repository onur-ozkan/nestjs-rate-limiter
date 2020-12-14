import { Controller, Get } from '@nestjs/common';

import { AppService } from '../services/app.service';
import { RateLimit } from '../../../../../../dist';

@Controller('points')
export class PointsController {
  constructor(private readonly appService: AppService) {}

  @RateLimit({
    points: 3,
    duration: 2,
    errorMessage: 'Accounts cannot be created more than once in per minute' })
  @Get()
  async getPoints() {
    try{
      const resp = await this.appService.getData();
      return resp;
    }catch(err){
      throw err;
    }
  }

  @RateLimit({
    points: 1,
    pointsConsumed: 1,
    duration: 2,
    errorMessage: 'Accounts cannot be created more than once in per minute' })
  @Get('/consumed')
  async getPointsConsumed() {
    try{
      const resp = await this.appService.getData();
      return resp;
    }catch(err){
      throw err;
    }
  }
}
