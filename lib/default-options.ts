import { DefaultOptions } from './rate-limiter.interface'

export const defaultRateLimiterOptions: DefaultOptions = {
	for: 'Express',
	type: 'Memory',
	points: 4,
	duration: 1,
	pointsConsumed: 1,
	keyPrefix: 'global',
	errorMessage: 'Rate limit exceeded'
}
