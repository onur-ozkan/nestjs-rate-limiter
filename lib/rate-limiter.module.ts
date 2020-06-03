import { DynamicModule, Module } from '@nestjs/common';
import { RateLimiterModuleAsyncOptions, RateLimiterModuleOptions } from './rate-limiter.interface';

import { RateLimiterCoreModule } from './rate-limiter-core.module';
import { defaultRateLimiterOptions } from './default-options';

@Module({})
export class RateLimiterModule {
    public static forRoot(options: RateLimiterModuleOptions = defaultRateLimiterOptions): DynamicModule {
        return {
            module: RateLimiterModule,
            imports: [RateLimiterCoreModule.forRoot(options)],
        };
    }

    public static forRootAsync(options: RateLimiterModuleAsyncOptions): DynamicModule {
        return {
            module: RateLimiterModule,
            imports: [RateLimiterCoreModule.forRootAsync(options)],
        };
    }
}
