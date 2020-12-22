import { Controller, Get } from '@nestjs/common';

import { AppService } from '../services/app.service';
import { RateLimit } from '../../../../../../dist';

@Controller('exec')
export class ExecEvenlyController {
  constructor(private readonly appService: AppService) {}

  @RateLimit({
    points: 1,
    duration: 5,
    errorMessage: 'Execeed maximum number of requests' })
  @Get('/evenly')
  async getExecEvenly() {
      const resp = await this.appService.getData();
      return resp;
  }
}
