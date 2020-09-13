import { Provider } from '@nestjs/common'
import { ModuleMetadata, Type } from '@nestjs/common/interfaces'

export interface RateLimiterOptions {
	for?: 'Express' | 'Fastify' | 'Microservice' | 'ExpressGraphql' | 'FastifyGraphql'
	type?: 'Memory' | 'Redis' | 'Memcache' | 'Postgres' | 'MySQL' | 'Mongo' | 'Queue'
	keyPrefix?: string
	points?: number
	pointsConsumed?: number
	inmemoryBlockDuration?: number
	duration?: number
	blockDuration?: number
	inmemoryBlockOnConsumed?: number
	whiteList?: string[]
	blackList?: string[]
	storeClient?: any
	insuranceLimiter?: any
	storeType?: string
	dbName?: string
	tableName?: string
	tableCreated?: boolean
	clearExpiredByTimeout?: boolean
	execEvenly?: boolean
	execEvenlyMinDelayMs?: any
	indexKeyPrefix?: any
	maxQueueSize?: number
	timeoutMs?: number
	errorMessage?: string
}

export interface RateLimiterOptionsFactory {
	createRateLimiterOptions(): Promise<RateLimiterOptions> | RateLimiterOptions
}

export interface RateLimiterModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
	useExisting?: Type<RateLimiterOptionsFactory>
	useClass?: Type<RateLimiterOptionsFactory>
	useFactory?: (...args: any[]) => Promise<RateLimiterOptions> | RateLimiterOptions
	inject?: any[]
	extraProviders?: Provider[]
}
