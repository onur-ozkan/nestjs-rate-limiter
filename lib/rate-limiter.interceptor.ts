import { Reflector } from '@nestjs/core'
import { NestInterceptor, Injectable, ExecutionContext, CallHandler, Inject, HttpStatus, Logger } from '@nestjs/common'
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
import * as env from 'dotenv'

env.config()
@Injectable()
export class RateLimiterInterceptor implements NestInterceptor {
	private rateLimiters: Map<string, RateLimiterAbstract> = new Map()
	private spesificOptions: RateLimiterOptions
	private queueLimiter: RateLimiterQueue

	constructor(@Inject('RATE_LIMITER_OPTIONS') private options: RateLimiterOptions, @Inject('Reflector') private readonly reflector: Reflector) {}

	async getRateLimiter(keyPrefix: string, options?: RateLimiterOptions): Promise<RateLimiterAbstract> {
		this.options = { ...defaultRateLimiterOptions, ...this.options }

		this.spesificOptions = null
		this.spesificOptions = options

		let rateLimiter: RateLimiterAbstract = this.rateLimiters.get(keyPrefix)

		const limiterOptions: RateLimiterOptions = {
			...this.options,
			...options,
			keyPrefix
		}

		const { ...libraryArguments } = limiterOptions
		if (libraryArguments.execEvenlyMinDelayMs === undefined) libraryArguments.execEvenlyMinDelayMs = (this.options.duration * 1000) / this.options.points

		if (!rateLimiter) {
			switch (this.spesificOptions?.type || this.options.type) {
				case 'Memory':
					rateLimiter = new RateLimiterMemory(libraryArguments)
					Logger.log(`Rate Limiter started with ${keyPrefix} key prefix`, 'RateLimiterMemory')
					break
				case 'Redis':
					rateLimiter = new RateLimiterRedis(libraryArguments as IRateLimiterStoreOptions)
					Logger.log(`Rate Limiter started with ${keyPrefix} key prefix`, 'RateLimiterRedis')
					break
				case 'Memcache':
					rateLimiter = new RateLimiterMemcache(libraryArguments as IRateLimiterStoreOptions)
					Logger.log(`Rate Limiter started with ${keyPrefix} key prefix`, 'RateLimiterMemcache')
					break
				case 'Postgres':
					if (libraryArguments.storeType === undefined) libraryArguments.storeType =  this.options.storeClient.constructor.name

					libraryArguments.tableName = this.spesificOptions?.tableName || this.options.tableName
					if (libraryArguments.tableName === undefined) {
						libraryArguments.tableName = this.spesificOptions?.keyPrefix || this.options.keyPrefix
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
					Logger.log(`Rate Limiter started with ${keyPrefix} key prefix`, 'RateLimiterPostgres')
					break
				case 'MySQL':
					if (libraryArguments.storeType === undefined) libraryArguments.storeType =  this.options.storeClient.constructor.name

					libraryArguments.tableName = this.spesificOptions?.tableName || this.options.tableName
					if (libraryArguments.tableName === undefined) {
						libraryArguments.tableName = this.spesificOptions?.keyPrefix || this.options.keyPrefix
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
					Logger.log(`Rate Limiter started with ${keyPrefix} key prefix`, 'RateLimiterMySQL')
					break
				case 'Mongo':
					if (libraryArguments.storeType === undefined) libraryArguments.storeType =  this.options.storeClient.constructor.name

					libraryArguments.tableName = this.spesificOptions?.tableName || this.options.tableName
					if (libraryArguments.tableName === undefined) {
						libraryArguments.tableName = this.spesificOptions?.keyPrefix || this.options.keyPrefix
					}

					rateLimiter = new RateLimiterMongo(libraryArguments as IRateLimiterStoreOptions)
					Logger.log(`Rate Limiter started with ${keyPrefix} key prefix`, 'RateLimiterMongo')
					break
				default:
					throw new Error(`Invalid "type" option provided to RateLimiterInterceptor. Value was ${limiterOptions.type}`)
			}

			this.rateLimiters.set(keyPrefix, rateLimiter)
		}

		if (this.spesificOptions?.queueEnabled || this.options.queueEnabled) {
			this.queueLimiter = new RateLimiterQueue(rateLimiter, {
				maxQueueSize: this.spesificOptions?.maxQueueSize || this.options.maxQueueSize
			})
		}

		rateLimiter = new RLWrapperBlackAndWhite({
			limiter: rateLimiter,
			whiteList: this.spesificOptions?.whiteList || this.options.whiteList,
			blackList: this.spesificOptions?.blackList || this.options.blackList,
			runActionAnyway: false
		})

		return rateLimiter
	}

	async intercept(context: ExecutionContext, next: CallHandler): Promise<any> {
		if (process.env.RATE_LIMITER === '0') return next.handle()

		let points: number = this.spesificOptions?.points || this.options.points
		let pointsConsumed: number = this.spesificOptions?.pointsConsumed || this.options.pointsConsumed
		let keyPrefix: string = this.spesificOptions?.keyPrefix || this.options.keyPrefix

		const reflectedOptions: RateLimiterOptions = this.reflector.get<RateLimiterOptions>('rateLimit', context.getHandler())

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

		const request = this.httpHandler(context).req
		const response = this.httpHandler(context).res

		const rateLimiter: RateLimiterAbstract = await this.getRateLimiter(keyPrefix, reflectedOptions)
		const key = request.ip.replace(/^.*:/, '')

		const operation = await this.responseHandler(response, key, rateLimiter, points, pointsConsumed, next)
		return operation
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

	private async responseHandler(response: any, key: any, rateLimiter: RateLimiterAbstract, points: number, pointsConsumed: number, next: CallHandler) {
		if (this.options.for === 'Fastify' || this.options.for === 'FastifyGraphql') {
			try {
				if (this.spesificOptions?.queueEnabled || this.options.queueEnabled) await this.queueLimiter.removeTokens(1)
				else {
					const rateLimiterResponse: RateLimiterRes = await rateLimiter.consume(key, pointsConsumed)

					response.header('Retry-After', Math.ceil(rateLimiterResponse.msBeforeNext / 1000))
					response.header('X-RateLimit-Limit', points)
					response.header('X-Retry-Remaining', rateLimiterResponse.remainingPoints)
					response.header('X-Retry-Reset', new Date(Date.now() + rateLimiterResponse.msBeforeNext).toUTCString())
				}
				return next.handle()
			} catch (rateLimiterResponse) {
				response.header('Retry-After', Math.ceil(rateLimiterResponse.msBeforeNext / 1000))
				response.code(429).header('Content-Type', 'application/json; charset=utf-8').send({
					statusCode: HttpStatus.TOO_MANY_REQUESTS,
					error: 'Too Many Requests',
					message: this.spesificOptions?.errorMessage || this.options.errorMessage
				})
			}
		} else {
			try {
				if (this.spesificOptions?.queueEnabled || this.options.queueEnabled) await this.queueLimiter.removeTokens(1)
				else {
					const rateLimiterResponse: RateLimiterRes = await rateLimiter.consume(key, pointsConsumed)

					response.set('Retry-After', Math.ceil(rateLimiterResponse.msBeforeNext / 1000))
					response.set('X-RateLimit-Limit', points)
					response.set('X-Retry-Remaining', rateLimiterResponse.remainingPoints)
					response.set('X-Retry-Reset', new Date(Date.now() + rateLimiterResponse.msBeforeNext).toUTCString())
				}
				return next.handle()
			} catch (rateLimiterResponse) {
				response.set('Retry-After', Math.ceil(rateLimiterResponse.msBeforeNext / 1000))
				response.status(429).json({
					statusCode: HttpStatus.TOO_MANY_REQUESTS,
					error: 'Too Many Requests',
					message: this.spesificOptions?.errorMessage || this.options.errorMessage
				})
			}
		}
	}
}
