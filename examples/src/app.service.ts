import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  async getHello(): Promise<string> {
    try{

      return new Promise( resolve => {
        setTimeout(()=>{
          console.log('Resolving timeout');
          resolve('Hello');
        }, 3000);
      });

    }catch(err){
      throw err;
    }

  }
}
