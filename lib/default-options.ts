import { RateLimiterOptions } from './rate-limiter.interface'

export const defaultRateLimiterOptions: RateLimiterOptions = {
	for: 'Express',
	type: 'Memory',
	keyPrefix: 'global',
	points: 4,
	pointsConsumed: 1,
	inmemoryBlockOnConsumed: 0,
	duration: 1,
	blockDuration: 0,
	inmemoryBlockDuration: 0,
	storeClient: undefined,
	insuranceLimiter: undefined,
	storeType: undefined,
	dbName: undefined,
	tableName: undefined,
	tableCreated: undefined,
	clearExpiredByTimeout: undefined,
	execEvenly: false,
	execEvenlyMinDelayMs: undefined,
	indexKeyPrefix: {},
	timeoutMs: 5000,
	errorMessage: 'Rate limit exceeded'
}
