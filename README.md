# Custom-nestjs-rate-limiter

## This package was created by modifying the nestjs-rate-limiter package.

## revised content

-   Add keyFactory option
-   I modified it so that developers can customize and use the key value when saving to redis.

## example

-   redis Connection ex)

```
@Module({
	providers: [
		{
			provide: 'RATE_LIMITER_OPTIONS',
			useFactory: async (): Promise<RateLimiterOptions> => {
				const redisClient = new Redis('url');

				return {
					points: 10,
					type: 'Redis',
					storeClient: redisClient,
				};
			},
		},
	],
	exports: ['RATE_LIMITER_OPTIONS'],
})
export class RateLimit {}
```

-   appModule

```
@Module({
	imports: [
		RateLimit,
	],
	controllers: [AppController],
	providers: [
		AppService,
		{
			provide: APP_GUARD,
			useClass: RateLimiterGuard,
		},
	],
})
export class AppModule implements NestModule {
```

-   controller

```

	@RateLimit({
		keyPrefix: 'sign-up',
		keyFactory: (req: Request) => {
			return 'hello custom rate-limiter';
      // The value of return is the key value of redis.
		},
		duration: 60,
		errorMessage: 'Accounts cannot be created more than once in per minute',
	})
	@Get('/rate/test')
	public async rateLimiterTest() {
		return 'hello';
	}
```

You can view user information captured by the limiter in the express request object.

### For more information on how to use it, please visit here.

-   https://github.com/ozkanonur/nestjs-rate-limiter

# Thanks
