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

const REFLECTOR = 'Reflector';

@Injectable()
export class RateLimiterInterceptor implements NestInterceptor {
    private rateLimiters: Map<string, RateLimiterAbstract> = new Map();

    constructor(
        @Inject(RATE_LIMITER_OPTIONS) private readonly options: RateLimiterModuleOptions,
        @Inject(REFLECTOR) private readonly reflector: Reflector,
    ) {}

    async getRateLimiter(keyPrefix: string, options?: RateLimiterModuleOptions): Promise<RateLimiterMemory> {
        let rateLimiter: RateLimiterMemory = this.rateLimiters.get(keyPrefix);

        const limiterOptions: RateLimiterModuleOptions = {
            ...this.options,
            ...options,
            keyPrefix,
        };

        const { type, pointsConsumed, ...libraryArguments } = limiterOptions;

        if (!rateLimiter) {
            if (limiterOptions.type === 'Memory') {
                rateLimiter = new RateLimiterMemory(libraryArguments);

                console.log('Created RateLimiterMemory with keyPrefix =', keyPrefix);
            } else if (limiterOptions.type === 'Redis') {
                rateLimiter = new RateLimiterRedis(libraryArguments as IRateLimiterStoreOptions);

                console.log('Created RateLimiterRedis with keyPrefix =', keyPrefix);
            } else if (limiterOptions.type === 'Memcache') {
                rateLimiter = new RateLimiterMemcache(libraryArguments as IRateLimiterStoreOptions);

                console.log('Created RateLimiterMemcache with keyPrefix =', keyPrefix);
            } else if (limiterOptions.type === 'Postgres') {
                rateLimiter = await new Promise((resolve, reject) => {
                    const limiter = new RateLimiterPostgres(libraryArguments as IRateLimiterStoreOptions, err => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(limiter);
                        }
                    });
                });

                console.log('Created RateLimiterPostgres with keyPrefix =', keyPrefix);
            } else if (limiterOptions.type === 'MySQL') {
                rateLimiter = await new Promise((resolve, reject) => {
                    const limiter = new RateLimiterMySQL(libraryArguments as IRateLimiterStoreOptions, err => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(limiter);
                        }
                    });
                });

                console.log('Created RateLimiterMySQL with keyPrefix =', keyPrefix);
            } else {
                throw new Error(
                    `Invalid "type" option provided to RateLimiterInterceptor. Value was "${limiterOptions.type}"`,
                );
            }

            this.rateLimiters.set(keyPrefix, rateLimiter);
        }

        return rateLimiter;
    }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        let points: number = this.options.points;
        let pointsConsumed: number = this.options.pointsConsumed;
        let keyPrefix: string = this.options.keyPrefix;

        const reflectedOptions: RateLimiterModuleOptions = this.reflector.get<RateLimiterModuleOptions>(
            'rateLimit',
            context.getHandler(),
        );

        if (reflectedOptions) {
            if (reflectedOptions.points) {
                points = reflectedOptions.points;
            }

            if (reflectedOptions.pointsConsumed) {
                pointsConsumed = reflectedOptions.pointsConsumed;
            }

            if (reflectedOptions.keyPrefix) {
                keyPrefix = reflectedOptions.keyPrefix;
            } else {
                keyPrefix = context.getClass().name;

                if (context.getHandler()) {
                    keyPrefix += `-${context.getHandler().name}`;
                }
            }
        }

        const rateLimiter: RateLimiterMemory = await this.getRateLimiter(keyPrefix, reflectedOptions);

        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();

        if (!response.set && response.header) response.set = response.header;
        else throw new Error('Cannot determine method to set response headers');

        const key = request.user ? request.user.id : request.ip;

        try {
            const rateLimiterResponse: RateLimiterRes = await rateLimiter.consume(key, pointsConsumed);

            response.set('Retry-After', Math.ceil(rateLimiterResponse.msBeforeNext / 1000));
            response.set('X-RateLimit-Limit', points);
            response.set('X-Retry-Remaining', rateLimiterResponse.remainingPoints);
            response.set('X-Retry-Reset', new Date(Date.now() + rateLimiterResponse.msBeforeNext).toUTCString());

            return next.handle();
        } catch (rateLimiterResponse) {
            if (rateLimiterResponse instanceof Error) {
                throw rateLimiterResponse;
            }

            response.set('Retry-After', Math.ceil(rateLimiterResponse.msBeforeNext / 1000));
            response.status(429).json({
                statusCode: HttpStatus.TOO_MANY_REQUESTS,
                error: 'Too Many Requests',
                message: 'Rate limit exceeded.',
            });
        }
    }
}
