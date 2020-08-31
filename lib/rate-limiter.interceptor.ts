import { Reflector } from '@nestjs/core'
import { Observable } from 'rxjs'
import { NestInterceptor, Injectable, ExecutionContext, CallHandler, Inject, HttpStatus, Logger } from '@nestjs/common'
import {
	RateLimiterMemory,
	RateLimiterRes,
	RateLimiterAbstract,
	RateLimiterRedis,
	IRateLimiterStoreOptions,
	RateLimiterMemcache,
	RateLimiterPostgres,
	RateLimiterMySQL
} from 'rate-limiter-flexible'

import { RateLimiterModuleOptions } from './rate-limiter.interface'
import { defaultRateLimiterOptions } from './default-options'

@Injectable()
export class RateLimiterInterceptor implements NestInterceptor {
	private rateLimiters: Map<string, RateLimiterAbstract> = new Map()

	constructor(
		@Inject('RATE_LIMITER_OPTIONS') private options: RateLimiterModuleOptions,
		@Inject('Reflector') private readonly reflector: Reflector
	) {
		this.options = { ...defaultRateLimiterOptions, ...this.options }
	}

	async getRateLimiter(
		keyPrefix: string,
		options?: RateLimiterModuleOptions
	): Promise<RateLimiterMemory & { for?: 'Express' | 'Fastify' | 'Microservice'; errorMessage?: string }> {
		this.options = { ...this.options, ...options }

		let rateLimiter: RateLimiterMemory & {
			for?: 'Express' | 'Fastify' | 'Microservice'
			errorMessage?: string
		} = this.rateLimiters.get(keyPrefix)

		const limiterOptions: RateLimiterModuleOptions = {
			...this.options,
			...options,
			keyPrefix
		}

		const { ...libraryArguments } = limiterOptions

		if (!rateLimiter) {
			switch (this.options.type) {
				case 'Memory':
					rateLimiter = new RateLimiterMemory(libraryArguments)
					Logger.log(`RateLimiterMemory created with ${keyPrefix} keyPrefix`)
					break
				case 'Redis':
					rateLimiter = new RateLimiterRedis(libraryArguments as IRateLimiterStoreOptions)
					Logger.log(`RateLimiterRedis created with ${keyPrefix} keyPrefix`)
					break
				case 'Memcache':
					rateLimiter = new RateLimiterMemcache(libraryArguments as IRateLimiterStoreOptions)
					Logger.log(`RateLimiterMemcache created with ${keyPrefix} keyPrefix`)
					break
				case 'Postgres':
					rateLimiter = await new Promise((resolve, reject) => {
						const limiter = new RateLimiterPostgres(libraryArguments as IRateLimiterStoreOptions, (err) => {
							if (err) {
								reject(err)
							} else {
								resolve(limiter)
							}
						})
					})
					Logger.log(`RateLimiterPostgres created with ${keyPrefix} keyPrefix`)
					break
				case 'MySQL':
					rateLimiter = await new Promise((resolve, reject) => {
						const limiter = new RateLimiterMySQL(libraryArguments as IRateLimiterStoreOptions, (err) => {
							if (err) {
								reject(err)
							} else {
								resolve(limiter)
							}
						})
					})
					Logger.log(`RateLimiterMySQL created with ${keyPrefix} keyPrefix`)
					break
				default:
					throw new Error(
						`Invalid "type" option provided to RateLimiterInterceptor. Value was ${limiterOptions.type}`
					)
			}

			this.rateLimiters.set(keyPrefix, rateLimiter)
		}

		return rateLimiter
	}

	async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
		let points: number = this.options.points
		let pointsConsumed: number = this.options.pointsConsumed
		let keyPrefix: string = this.options.keyPrefix

		const reflectedOptions: RateLimiterModuleOptions = this.reflector.get<RateLimiterModuleOptions>(
			'rateLimit',
			context.getHandler()
		)

		if (reflectedOptions) {
			if (reflectedOptions.points) {
				points = reflectedOptions.points
			}

			if (reflectedOptions.pointsConsumed) {
				pointsConsumed = reflectedOptions.pointsConsumed
			}

			if (reflectedOptions.keyPrefix) {
				keyPrefix = reflectedOptions.keyPrefix
			} else {
				keyPrefix = context.getClass().name

				if (context.getHandler()) {
					keyPrefix += `-${context.getHandler().name}`
				}
			}
		}

		const rateLimiter: RateLimiterMemory & {
			for?: 'Express' | 'Fastify' | 'Microservice'
			errorMessage?: string
		} = await this.getRateLimiter(keyPrefix, reflectedOptions)

		const request = context.switchToHttp().getRequest()
		const response = context.switchToHttp().getResponse()

		const key = request.user ? request.user.id : request.ip

		if (this.options.for == 'Fastify') {
			try {
				const rateLimiterResponse: RateLimiterRes = await rateLimiter.consume(key, pointsConsumed)

				response.header('Retry-After', Math.ceil(rateLimiterResponse.msBeforeNext / 1000))
				response.header('X-RateLimit-Limit', points)
				response.header('X-Retry-Remaining', rateLimiterResponse.remainingPoints)
				response.header('X-Retry-Reset', new Date(Date.now() + rateLimiterResponse.msBeforeNext).toUTCString())

			} catch (rateLimiterResponse) {
				response.header('Retry-After', Math.ceil(rateLimiterResponse.msBeforeNext / 1000))
				response.code(429).header('Content-Type', 'application/json; charset=utf-8').send({
					statusCode: HttpStatus.TOO_MANY_REQUESTS,
					error: 'Too Many Requests',
					message: this.options.errorMessage
				})
			}
		} else {
			try {
				const rateLimiterResponse: RateLimiterRes = await rateLimiter.consume(key, pointsConsumed)

				response.set('Retry-After', Math.ceil(rateLimiterResponse.msBeforeNext / 1000))
				response.set('X-RateLimit-Limit', points)
				response.set('X-Retry-Remaining', rateLimiterResponse.remainingPoints)
				response.set('X-Retry-Reset', new Date(Date.now() + rateLimiterResponse.msBeforeNext).toUTCString())

			} catch (rateLimiterResponse) {
				response.set('Retry-After', Math.ceil(rateLimiterResponse.msBeforeNext / 1000))
				response.status(429).json({
					statusCode: HttpStatus.TOO_MANY_REQUESTS,
					error: 'Too Many Requests',
					message: this.options.errorMessage
				})
			}
		}
		return next.handle()
	}
}
