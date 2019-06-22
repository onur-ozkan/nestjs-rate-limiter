import { SetMetadata } from '@nestjs/common';

import { RateLimiterModuleOptions } from './rate-limiter.interface';

export const RateLimit = (options: RateLimiterModuleOptions): MethodDecorator => SetMetadata('rateLimit', options);
