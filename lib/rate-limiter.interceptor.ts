import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';

import { Observable } from 'rxjs';
import { RateLimiterService } from './rate-limiter.service';

@Injectable()
export class RateLimiterInterceptor implements NestInterceptor {
    constructor(private readonly rateLimiterService: RateLimiterService) {}

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        await this.rateLimiterService.executeRateLimiter(context);
        return next.handle();
    }
}
