import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import {
    RateLimiterModuleAsyncOptions,
    RateLimiterModuleOptions,
    RateLimiterOptionsFactory,
} from './rate-limiter.interface';

import { RATE_LIMITER_OPTIONS } from './rate-limiter.constants';
import { RateLimiterService } from './rate-limiter.service';
import { ValueProvider } from '@nestjs/common/interfaces';

@Global()
@Module({})
export class RateLimiterCoreModule {
    public static forRoot(options: RateLimiterModuleOptions): DynamicModule {
        const RateLimiterOptionsProvider: ValueProvider<RateLimiterModuleOptions> = {
            provide: RATE_LIMITER_OPTIONS,
            useValue: options,
        };

        return {
            module: RateLimiterCoreModule,
            providers: [RateLimiterOptionsProvider, RateLimiterService],
            exports: [RateLimiterService],
        };
    }

    public static forRootAsync(options: RateLimiterModuleAsyncOptions): DynamicModule {
        const providers: Provider[] = this.createAsyncProviders(options);

        return {
            module: RateLimiterCoreModule,
            providers: [...providers, RateLimiterService],
            imports: options.imports,
            exports: [RateLimiterService],
        };
    }

    private static createAsyncProviders(options: RateLimiterModuleAsyncOptions): Provider[] {
        const providers: Provider[] = [this.createAsyncOptionsProvider(options)];

        if (options.useClass) {
            providers.push({
                provide: options.useClass,
                useClass: options.useClass,
            });
        }

        return providers;
    }

    private static createAsyncOptionsProvider(options: RateLimiterModuleAsyncOptions): Provider {
        if (options.useFactory) {
            return {
                name: RATE_LIMITER_OPTIONS,
                provide: RATE_LIMITER_OPTIONS,
                useFactory: options.useFactory,
                inject: options.inject || [],
            };
        }

        return {
            name: RATE_LIMITER_OPTIONS,
            provide: RATE_LIMITER_OPTIONS,
            useFactory: async (optionsFactory: RateLimiterOptionsFactory) => {
                return optionsFactory.createRateLimiterOptions();
            },
            inject: [options.useExisting || options.useClass],
        };
    }
}
