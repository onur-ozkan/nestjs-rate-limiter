import { Provider } from '@nestjs/common'
import { ModuleMetadata, Type } from '@nestjs/common/interfaces'

export interface DefaultOptions {
	for?: 'Express' | 'Fastify' | 'Microservice' | 'ExpressGraphql' | 'FastifyGraphql'
	type?: 'Memory' | 'Redis' | 'Memcache' | 'Postgres' | 'MySQL'
	points?: number
	duration?: number
	pointsConsumed?: number
	errorMessage?: string
	keyPrefix?: string
}

export interface RateLimiterModuleOptions extends DefaultOptions {}

export interface RateLimiterOptionsFactory {
	createRateLimiterOptions(): Promise<RateLimiterModuleOptions> | RateLimiterModuleOptions
}

export interface RateLimiterModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
	useExisting?: Type<RateLimiterOptionsFactory>
	useClass?: Type<RateLimiterOptionsFactory>
	useFactory?: (...args: any[]) => Promise<RateLimiterModuleOptions> | RateLimiterModuleOptions
	inject?: any[]
	extraProviders?: Provider[]
}
