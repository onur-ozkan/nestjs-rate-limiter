import { SetMetadata } from '@nestjs/common';

import { RateLimiterModuleOptions } from './rate-limiter.interface';

export const RateLimit: any = (options: RateLimiterModuleOptions) => SetMetadata('rateLimit', options);
