import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  async getData(): Promise<{ message: string }>  {

    try{
      // tslint:disable-next-line: no-console
      console.log( 'Calling get Data');
      return new Promise( resolve => {
        // tslint:disable-next-line: no-console
        console.log( 'Resolveing Promise');
        return resolve({message:'Welcome to rate-limiter-express-app!'});
      })
    }catch(err){
      throw err;
    }
  }
}