import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { NestInterceptor, Injectable, ExecutionContext, CallHandler, Inject, HttpStatus } from '@nestjs/common';
import {
    RateLimiterMemory,
    RateLimiterRes,
    RateLimiterAbstract,
    RateLimiterRedis,
    IRateLimiterStoreOptions,
    RateLimiterMemcache,
    RateLimiterPostgres,
    RateLimiterMySQL,
} from 'rate-limiter-flexible';

import { RATE_LIMITER_OPTIONS } from './rate-limiter.constants';
import { RateLimiterModuleOptions } from './rate-limiter.interface';
import { RateLimiterInterceptor } from './rate-limiter.interceptor';

const REFLECTOR = 'Reflector';

@Injectable()
export class RateLimiterDecoratorOnlyInterceptor extends RateLimiterInterceptor {
    constructor(
        @Inject(REFLECTOR) reflector: Reflector,
        @Inject(RATE_LIMITER_OPTIONS) options: RateLimiterModuleOptions,
    ) {
        super(reflector, { ...options, rateLimitDecoratorOnly: true });
    }
}
