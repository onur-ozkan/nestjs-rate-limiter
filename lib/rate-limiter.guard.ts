import { Reflector } from '@nestjs/core'
import { Injectable, ExecutionContext, Inject, HttpStatus, Logger, HttpException, CanActivate } from '@nestjs/common'
import {
	RateLimiterMemory,
	RateLimiterRes,
	RateLimiterAbstract,
	RateLimiterRedis,
	IRateLimiterStoreOptions,
	RateLimiterMemcache,
	RateLimiterPostgres,
	RateLimiterMySQL,
	RateLimiterMongo,
	RateLimiterQueue,
	RLWrapperBlackAndWhite
} from 'rate-limiter-flexible'
import { RateLimiterOptions } from './rate-limiter.interface'
import { defaultRateLimiterOptions } from './default-options'

@Injectable()
export class RateLimiterGuard implements CanActivate {
	private rateLimiters: Map<string, RateLimiterAbstract> = new Map()
	private specificOptions: RateLimiterOptions
	private queueLimiter: RateLimiterQueue

	constructor(@Inject('RATE_LIMITER_OPTIONS') private options: RateLimiterOptions, @Inject('Reflector') private readonly reflector: Reflector) {}

	async getRateLimiter(options?: RateLimiterOptions): Promise<RateLimiterAbstract> {
		this.options = { ...defaultRateLimiterOptions, ...this.options }
		this.specificOptions = null
		this.specificOptions = options

		const limiterOptions: RateLimiterOptions = {
			...this.options,
			...options
		}

		const { ...libraryArguments } = limiterOptions

		let rateLimiter: RateLimiterAbstract = this.rateLimiters.get(libraryArguments.keyPrefix)

		if (libraryArguments.execEvenlyMinDelayMs === undefined)
			libraryArguments.execEvenlyMinDelayMs = (this.options.duration * 1000) / this.options.points

		if (!rateLimiter) {
			const logger = this.specificOptions?.logger || this.options.logger
			switch (this.specificOptions?.type || this.options.type) {
				case 'Memory':
					rateLimiter = new RateLimiterMemory(libraryArguments)
					if (logger) {
						Logger.log(`Rate Limiter started with ${limiterOptions.keyPrefix} key prefix`, 'RateLimiterMemory')
					}
					break
				case 'Redis':
					rateLimiter = new RateLimiterRedis(libraryArguments as IRateLimiterStoreOptions)
					if (logger) {
						Logger.log(`Rate Limiter started with ${limiterOptions.keyPrefix} key prefix`, 'RateLimiterRedis')
					}
					break
				case 'Memcache':
					rateLimiter = new RateLimiterMemcache(libraryArguments as IRateLimiterStoreOptions)
					if (logger) {
						Logger.log(`Rate Limiter started with ${limiterOptions.keyPrefix} key prefix`, 'RateLimiterMemcache')
					}
					break
				case 'Postgres':
					if (libraryArguments.storeType === undefined) libraryArguments.storeType = this.options.storeClient.constructor.name

					libraryArguments.tableName = this.specificOptions?.tableName || this.options.tableName
					if (libraryArguments.tableName === undefined) {
						libraryArguments.tableName = this.specificOptions?.keyPrefix || this.options.keyPrefix
					}

					if (libraryArguments.tableCreated === undefined) libraryArguments.tableCreated = false
					if (libraryArguments.clearExpiredByTimeout === undefined) libraryArguments.clearExpiredByTimeout = true

					rateLimiter = await new Promise((resolve, reject) => {
						const limiter = new RateLimiterPostgres(libraryArguments as IRateLimiterStoreOptions, (err) => {
							if (err) {
								reject(err)
							} else {
								resolve(limiter)
							}
						})
					})
					if (logger) {
						Logger.log(`Rate Limiter started with ${limiterOptions.keyPrefix} key prefix`, 'RateLimiterPostgres')
					}
					break
				case 'MySQL':
					if (libraryArguments.storeType === undefined) libraryArguments.storeType = this.options.storeClient.constructor.name

					libraryArguments.tableName = this.specificOptions?.tableName || this.options.tableName
					if (libraryArguments.tableName === undefined) {
						libraryArguments.tableName = this.specificOptions?.keyPrefix || this.options.keyPrefix
					}

					if (libraryArguments.tableCreated === undefined) libraryArguments.tableCreated = false
					if (libraryArguments.clearExpiredByTimeout === undefined) libraryArguments.clearExpiredByTimeout = true

					rateLimiter = await new Promise((resolve, reject) => {
						const limiter = new RateLimiterMySQL(libraryArguments as IRateLimiterStoreOptions, (err) => {
							if (err) {
								reject(err)
							} else {
								resolve(limiter)
							}
						})
					})
					if (logger) {
						Logger.log(`Rate Limiter started with ${limiterOptions.keyPrefix} key prefix`, 'RateLimiterMySQL')
					}
					break
				case 'Mongo':
					if (libraryArguments.storeType === undefined) libraryArguments.storeType = this.options.storeClient.constructor.name

					libraryArguments.tableName = this.specificOptions?.tableName || this.options.tableName
					if (libraryArguments.tableName === undefined) {
						libraryArguments.tableName = this.specificOptions?.keyPrefix || this.options.keyPrefix
					}

					rateLimiter = new RateLimiterMongo(libraryArguments as IRateLimiterStoreOptions)
					if (logger) {
						Logger.log(`Rate Limiter started with ${limiterOptions.keyPrefix} key prefix`, 'RateLimiterMongo')
					}
					break
				default:
					throw new Error(`Invalid "type" option provided to RateLimiterGuard. Value was ${limiterOptions.type}`)
			}

			this.rateLimiters.set(limiterOptions.keyPrefix, rateLimiter)
		}

		if (this.specificOptions?.queueEnabled || this.options.queueEnabled) {
			this.queueLimiter = new RateLimiterQueue(rateLimiter, {
				maxQueueSize: this.specificOptions?.maxQueueSize || this.options.maxQueueSize
			})
		}

		rateLimiter = new RLWrapperBlackAndWhite({
			limiter: rateLimiter,
			whiteList: this.specificOptions?.whiteList || this.options.whiteList,
			blackList: this.specificOptions?.blackList || this.options.blackList,
			runActionAnyway: false
		})

		return rateLimiter
	}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		let points: number = this.specificOptions?.points || this.options.points
		let pointsConsumed: number = this.specificOptions?.pointsConsumed || this.options.pointsConsumed

		const reflectedOptions: RateLimiterOptions = this.reflector.get<RateLimiterOptions>('rateLimit', context.getHandler())

		if (reflectedOptions) {
			if (reflectedOptions.points) {
				points = reflectedOptions.points
			}

			if (reflectedOptions.pointsConsumed) {
				pointsConsumed = reflectedOptions.pointsConsumed
			}
		}

		const request = this.httpHandler(context).req
		const response = this.httpHandler(context).res

		if (reflectedOptions.keyFactory(request)) {
			const rateLimiter: RateLimiterAbstract = await this.getRateLimiter(reflectedOptions)
			const key = reflectedOptions.keyFactory(request)

			await this.responseHandler(response, key, rateLimiter, points, pointsConsumed)
		} else {
			const rateLimiter: RateLimiterAbstract = await this.getRateLimiter(reflectedOptions)
			const key = this.getIpFromRequest(request)

			await this.responseHandler(response, key, rateLimiter, points, pointsConsumed)
		}
		return true
	}

	protected getIpFromRequest(request: { ip: string }): string {
	        return request.ip?.match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/)?.[0]
	}

	private httpHandler(context: ExecutionContext) {
		if (this.options.for === 'ExpressGraphql') {
			return {
				req: context.getArgByIndex(2).req,
				res: context.getArgByIndex(2).req.res
			}
		} else if (this.options.for === 'FastifyGraphql') {
			return {
				req: context.getArgByIndex(2).req,
				res: context.getArgByIndex(2).res
			}
		} else {
			return {
				req: context.switchToHttp().getRequest(),
				res: context.switchToHttp().getResponse()
			}
		}
	}

	private async setResponseHeaders(response: any, points: number, rateLimiterResponse: RateLimiterRes) {
		response.header('Retry-After', Math.ceil(rateLimiterResponse.msBeforeNext / 1000))
		response.header('X-RateLimit-Limit', points)
		response.header('X-Retry-Remaining', rateLimiterResponse.remainingPoints)
		response.header('X-Retry-Reset', new Date(Date.now() + rateLimiterResponse.msBeforeNext).toUTCString())
	}

	private async responseHandler(response: any, key: any, rateLimiter: RateLimiterAbstract, points: number, pointsConsumed: number) {
		try {
			if (this.specificOptions?.queueEnabled || this.options.queueEnabled) await this.queueLimiter.removeTokens(1)
			else {
				const rateLimiterResponse: RateLimiterRes = await rateLimiter.consume(key, pointsConsumed)
				if (!this.specificOptions?.omitResponseHeaders && !this.options.omitResponseHeaders)
					this.setResponseHeaders(response, points, rateLimiterResponse)
			}
		} catch (rateLimiterResponse) {
			response.header('Retry-After', Math.ceil(rateLimiterResponse.msBeforeNext / 1000))
			if (typeof this.specificOptions?.customResponseSchema === 'function' || typeof this.options.customResponseSchema === 'function') {
				const errorBody = this.specificOptions?.customResponseSchema || this.options.customResponseSchema
				throw new HttpException(errorBody(rateLimiterResponse), HttpStatus.TOO_MANY_REQUESTS)
			} else {
				throw new HttpException(this.specificOptions?.errorMessage || this.options.errorMessage, HttpStatus.TOO_MANY_REQUESTS)
			}
		}
	}
}
