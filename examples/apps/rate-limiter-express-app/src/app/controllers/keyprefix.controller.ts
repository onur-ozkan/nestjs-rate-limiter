import { Controller, Get } from '@nestjs/common';

import { AppService } from '../services/app.service';
import { RateLimit } from '../../../../../../dist';

@Controller('keyprefix')
export class KeyPrefixController {
  constructor(private readonly appService: AppService) {}

  @RateLimit({
    points: 1,
    duration: 3,
    errorMessage: 'Too many requests on the endpoint' })
  @Get('/global')
  async getGlobalKeyPrefix() {
        // Note the format for incoming localhost will be ::1 and the rate limiter will
        // parse hout the leading //
        const resp = await this.appService.getData();
        return resp;
  }
  @RateLimit({
    points: 5,
    duration: 3,
    keyPrefix: 'unique',
    errorMessage: 'Too many requests on the endpoint' })
  @Get('/unique')
  async getBlockSpecificIP() {
      const resp = await this.appService.getData();
      return resp;
  }
}
