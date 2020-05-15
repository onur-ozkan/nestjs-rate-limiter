import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { RateLimiterService } from './rate-limiter.service';

@Injectable()
export class RateLimiterGuard implements CanActivate {
    constructor(private readonly rateLimiterService: RateLimiterService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        await this.rateLimiterService.executeRateLimiter(context);
        return true;
    }
}
