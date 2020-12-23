import { Controller, Get } from '@nestjs/common';

import { AppService } from '../services/app.service';
import { RateLimit } from '../../../../../../dist';

@Controller('exec')
export class ExecEvenlyController {
  constructor(private readonly appService: AppService) {}

  @RateLimit({
    points: 5,
    duration: 5,
    errorMessage: 'Execeed maximum number of requests' })
  @Get('/notevenly')
  async getExecNotEvenly() {
      // Will return the responses as they come in
      const resp = await this.appService.getData();
      return resp;
  }

  @RateLimit({
    points: 5,
    duration: 5,
    execEvenlyMinDelayMs: 200,
    execEvenly: true,
    errorMessage: 'Execeed maximum number of requests' })
  @Get('/evenly')
  async getExecEvenly() {
      // Will return the responses in an even distribution at about
      // ever 200 milliseconds between each call
      const resp = await this.appService.getData();
      return resp;
  }
}
