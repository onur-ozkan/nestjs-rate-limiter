import { RateLimiterOptionsFactory, RateLimiterModuleAsyncOptions } from './rate-limiter.interface'

describe('RateLimiterOptionsFactory', () => {
	it('should validate that RateLimiterOptionsFactory exists', async () => {
		const rateLimiterOptionsFactory: RateLimiterOptionsFactory = {
			createRateLimiterOptions: jest.fn()
		}
		expect(rateLimiterOptionsFactory).toBeDefined()
		expect(rateLimiterOptionsFactory.createRateLimiterOptions).toBeDefined()
	})
})

describe('RateLimiterModuleAsyncOptions', () => {
	it('should validate that RateLimiterModuleAsyncOptions with no properties', async () => {
		const rateLimiterModuleAsyncOptions: RateLimiterModuleAsyncOptions = {}
		expect(rateLimiterModuleAsyncOptions).toBeDefined()
		expect(rateLimiterModuleAsyncOptions.useExisting).toBeUndefined()
	})

	it('should validate that RateLimiterModuleAsyncOptions with optional properties', async () => {
		const rateLimiterModuleAsyncOptions: RateLimiterModuleAsyncOptions = {
			useFactory: jest.fn(),
			inject: ['test']
		}
		expect(rateLimiterModuleAsyncOptions).toBeDefined()
		expect(rateLimiterModuleAsyncOptions.useFactory).toBeDefined()
		expect(rateLimiterModuleAsyncOptions.inject.length).toBe(1)
	})
});
