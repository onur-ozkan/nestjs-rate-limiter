import { Controller, Get } from '@nestjs/common';

import { AppService } from '../services/app.service';
import { RateLimit } from '../../../../../../dist';

@Controller('blackwhite')
export class BlackWhiteController {
  constructor(private readonly appService: AppService) {}

  @RateLimit({
    blackList:['1'],
    errorMessage: 'The IP Address has been blocked' })
  @Get('/blocklocal')
  async getBlockLocal() {
        // Note the format for incoming localhost will be ::1 and the rate limiter will
        // parse hout the leading //
        const resp = await this.appService.getData();
        return resp;
  }

  @RateLimit({
    blackList:['192.168.0.11', '192.168.2.101'],
    errorMessage: 'The IP Address has been blocked' })
  @Get('/blockspecific')
  async getBlockSpecificIP() {
      const resp = await this.appService.getData();
      return resp;
  }

  @RateLimit({
      points: 1,
      duration: 10,
      whiteList:['1', '127.0.0.1'],
      errorMessage: 'The IP Address is making too many requests' })
  @Get('/enablelocal')
  async getEnableLocalHost() {
      // The following enpoint will restrict all IP addresses to 1 request every
      // 10 seconds, except localhost ```::1```
      const resp = await this.appService.getData();
      return resp;
  }

  @RateLimit({
    points: 1,
    duration: 10,
    whiteList:['192.168.0.1','192.168.2.101'],
    errorMessage: 'The IP Address is making too many requests' })
  @Get('/restrictlocal')
  async getRestrictLocalHost() {
      // The following enpoint will restrict all IP addresses to 1 request every
      // 10 seconds, except the following: ```192.168.0.1,192.168.2.101```
      const resp = await this.appService.getData();
      return resp;

  }
}
