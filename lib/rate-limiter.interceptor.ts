import {
    CallHandler,
    ExecutionContext,
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
    IRateLimiterStoreOptions,
    RateLimiterAbstract,
    RateLimiterMemcache,
    RateLimiterMemory,
    RateLimiterMySQL,
    RateLimiterPostgres,
    RateLimiterRedis,
    RateLimiterRes,
} from 'rate-limiter-flexible';
import { Observable } from 'rxjs';
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

        const key = request.user ? request.user.id : request.ip;

        try {
            const rateLimiterResponse: RateLimiterRes = await rateLimiter.consume(key, pointsConsumed);
            const retryAfterValue = Math.ceil(rateLimiterResponse.msBeforeNext / 1000);
            response.setHeader('Retry-After', retryAfterValue);
            response.setHeader('X-RateLimit-Limit', points);
            response.setHeader('X-Retry-Remaining', rateLimiterResponse.remainingPoints);
            const resetValue = new Date(Date.now() + rateLimiterResponse.msBeforeNext).getTime();
            response.setHeader('X-Retry-Reset', resetValue);
            return next.handle();
        } catch (rateLimiterResponse) {
            if (rateLimiterResponse instanceof Error) {
                throw rateLimiterResponse;
            }
            const retryAfterValue = Math.ceil(rateLimiterResponse.msBeforeNext / 1000);
            response.setHeader('Retry-After', retryAfterValue);
            const r = { message: 'Rate limit exceeded.' };
            throw new HttpException(r, HttpStatus.TOO_MANY_REQUESTS);
        }
    }
}
