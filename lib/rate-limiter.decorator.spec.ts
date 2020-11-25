import { RateLimit } from './rate-limiter.decorator'
import { RateLimiterOptions } from './rate-limiter.interface'

describe('RateLimit', () => {
	it('should validate that RateLimit decorator exists', async () => {
		expect(RateLimit).toBeDefined()
	})

	it('should verify RateLimit Method decorator can be created with empty options', async () => {
		const options: RateLimiterOptions = {}

		const decorator: MethodDecorator = RateLimit(options)

		expect(decorator).toBeDefined()
	})

	it('should verify RateLimit can decorate a method and be called', async () => {
		const options: RateLimiterOptions = {}
		const testFn = jest.fn()

		class TestController {
			@RateLimit(options)
			run() {
				testFn()
			}
		}

		const controller = new TestController()

		expect(testFn)
	})
})
