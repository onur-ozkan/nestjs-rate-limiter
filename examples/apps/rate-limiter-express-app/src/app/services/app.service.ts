import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  async getData(): Promise<{ message: string }>  {
      return new Promise( resolve => {
        return resolve({message:'Welcome to rate-limiter-express-app!'});
      })
  }
}