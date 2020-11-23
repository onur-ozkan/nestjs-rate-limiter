import { RateLimiterOptionsFactory, RateLimiterModuleAsyncOptions, RateLimiterOptions } from './rate-limiter.interface'

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
})

describe('RateLimiterOptions', () => {
	it('should validate that RateLimiterOptions with no properties', async () => {
		const rateLimiterOptions: RateLimiterOptions = {}
		expect(rateLimiterOptions).toBeDefined()
		expect(rateLimiterOptions.for).toBeUndefined()
	})

	it('should validate that RateLimiterOptions with no properties', async () => {
		const rateLimiterOptions: RateLimiterOptions = {
			for: 'Express',
			type: 'Memory',
			points: 2,
			pointsConsumed: 3,
			dbName: 'test'
		}
		expect(rateLimiterOptions).toBeDefined()
		expect(rateLimiterOptions.for).toBe('Express')
		expect(rateLimiterOptions.type).toBe('Memory')
		expect(rateLimiterOptions.points).toBe(2)
		expect(rateLimiterOptions.pointsConsumed).toBe(3)
		expect(rateLimiterOptions.dbName).toBe('test')
	})
})
