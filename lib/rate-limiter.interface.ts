import { Provider } from '@nestjs/common'
import { ModuleMetadata, Type } from '@nestjs/common/interfaces'
import { RateLimiterRes } from 'rate-limiter-flexible'

export interface RateLimiterOptions {
	for?: 'Express' | 'Fastify' | 'Microservice' | 'ExpressGraphql' | 'FastifyGraphql'
	type?: 'Memory' | 'Redis' | 'Memcache' | 'Postgres' | 'MySQL' | 'Mongo'
	keyPrefix?: string
	keyFactory?: (request: Request) => {}
	points?: number
	pointsConsumed?: number
	inmemoryBlockDuration?: number
	duration?: number
	blockDuration?: number
	inmemoryBlockOnConsumed?: number
	queueEnabled?: boolean
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
	execEvenlyMinDelayMs?: number
	indexKeyPrefix?: {}
	maxQueueSize?: number
	omitResponseHeaders?: boolean
	errorMessage?: string
	logger?: boolean
	customResponseSchema?: (rateLimiterResponse: RateLimiterRes) => {}
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
