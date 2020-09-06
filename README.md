<p align="center">
  <img width="30%" src="https://user-images.githubusercontent.com/39852038/91653275-d14ace00-eaa7-11ea-9654-492cca9506d5.png" />
</p>

<h2 align="center">Rate Limiter Module for NestJS</h2>

<p align="center">
<a href="https://www.codefactor.io/repository/github/ozkanonur/nestjs-rate-limiter"><img src="https://www.codefactor.io/repository/github/ozkanonur/nestjs-rate-limiter/badge?style=flat-square&sanitize=true" alt="Code Quality" /></a>
<a href="https://www.npmjs.com/package/nestjs-rate-limiter"><img src="https://img.shields.io/npm/v/nestjs-rate-limiter.svg?style=flat-square&sanitize=true" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/package/nestjs-rate-limiter"><img src="https://img.shields.io/npm/dm/nestjs-rate-limiter.svg?style=flat-square&sanitize=true" alt="NPM Downloads" /></a>
<a href="#"><img src="https://img.shields.io/npm/l/nestjs-rate-limiter.svg?colorB=black&label=LICENSE&style=flat-square&sanitize=true" alt="License"/></a>

</p>

# Description

`nestjs-rate-limiter` is a module which adds in configurable rate limiting for [Nest](https://github.com/nestjs/nest) applications.

Under the hood it uses [rate-limiter-flexible](https://github.com/animir/node-rate-limiter-flexible).

# Installation

```bash
npm i --save nestjs-rate-limiter
```

Or if you use Yarn:

```bash
yarn add nestjs-rate-limiter
```

### Requirements

`nestjs-rate-limiter` is built to work with Nest 6 and newer versions.

# Usage

### Include Module

First you need to import this module into your main application module:

> app.module.ts

```ts
import { RateLimiterModule } from 'nestjs-rate-limiter';

@Module({
    imports: [RateLimiterModule],
})
export class ApplicationModule {}
```

### Using Interceptor

Now you need to register the interceptor. You can do this only on some routes:

> app.controller.ts

```ts
import { RateLimiterInterceptor } from 'nestjs-rate-limiter';

@UseInterceptors(RateLimiterInterceptor)
@Get('/login')
public async login() {
    console.log('hello');
}
```

Or you can choose to register the interceptor globally:

> app.module.ts

```ts
import { APP_INTERCEPTOR } from '@nestjs/core';
import { RateLimiterModule, RateLimiterInterceptor } from 'nestjs-rate-limiter';

@Module({
    imports: [RateLimiterModule],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: RateLimiterInterceptor,
        },
    ],
})
export class ApplicationModule {}
```

### Decorator

You can use the `@RateLimit` decorator to specify the points and duration for rate limiting on a per controller or per
route basis:

> app.controller.ts

```ts
import { RateLimit } from 'nestjs-rate-limiter';

@RateLimit({ points: 1, duration: 60, errorMessage: 'Accounts cannot be created more than once in per minute' })
@Get('/signup')
public async signUp() {
    console.log('hello');
}
```

The above example would rate limit the `/signup` route to 1 request every 60 seconds.

Note that when passing in options via the decorator, it will combine the options for the module (defined via
`RateLimiterModule.register` or the default ones) along with the decorator options. While this should be fine for most
use cases, if you have defined a global interceptor with a `pointsConsumed` option, that will also apply to all
decorated requests. So if you need to have a different `pointsConsumed` for decorated requests than what you have
defined globally, you must pass it in when writing your decorator.

Also note that if the `keyPrefix` is already in use, it will not update any options, only reuse the existing rate
limiter object when it was last instantiated. This should be fine with the decorators, unless you manually specify a
duplicate `keyPrefix` or reuse the same class and method names with the decorator.

# Configuration

### Constructor Options
| Option Name | Required | Type | Default |
| ------ | ------ | ------ | ------|
| for | false | 'Express' - 'Fastify' - 'Microservice' - 'ExpressGraphql' | 'Express' |
| type | false | 'Memory' - 'Redis' - 'Memcache' - 'Postgres' - 'MySQL' | 'Memory' |
| points | false | number | 4 |
| duration | false | number | 1 |
| pointsConsumed | false | number | 1 |
| keyPrefix | false | string | 'global' |
| errorMessage | false | string | 'Rate limit exceeded' |

To change the settings for `nestjs-rate-limiter`, you can define a `RateLimiterModuleOptions` object when registering
the module:

> app.module.ts

```ts
@Module({
    imports: [
        RateLimiterModule.register({
            for: 'Fastify',
            type: 'Memory',
            points: 15,
            duration: 90,
            pointsConsumed: 1,
            keyPrefix: 'global',
            errorMessage: 'Rate limit exceeded, you have to wait before trying again'
        }),
    ],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: RateLimiterInterceptor,
        },
    ],
})
export class ApplicationModule {}
```

The above example would rate limit the `/login` route to 1 request every 1 second using an im memory cache.

When defining your options, you can pass through any options supported by `rate-limiter-flexible` in order to setup any
config needed. For a full list see <https://github.com/animir/node-rate-limiter-flexible/wiki/Options>.

The main important options (and the ones used solely by this library) are below.

### for: 'Express' | 'Fastify' | 'Microservice' | 'ExpressGraphql'

This is the value which is based technology of your project. The default Nest applications are Express therefore this value is also comes with Express value as default.

See official documentation for other supported technologies other than Express:

-   [Fastify](https://docs.nestjs.com/techniques/performance)
-   [Microservices](https://docs.nestjs.com/microservices/basics)
-   [Graphql](https://docs.nestjs.com/graphql/quick-start)

### type: 'Memory' | 'Redis' | 'Memcached' | 'Postgres' | 'MySQL'

This is the type of rate limiter that the underlying `rate-limiter-flexible` library will use to keep track of the
requests made by users.

-   [Memory](https://github.com/animir/node-rate-limiter-flexible/wiki/Memory)
-   [Redis](https://github.com/animir/node-rate-limiter-flexible/wiki/Redis)
-   [Memcached](https://github.com/animir/node-rate-limiter-flexible/wiki/Memcached)
-   [Postgres](https://github.com/animir/node-rate-limiter-flexible/wiki/Postgres)
-   [MySQL](https://github.com/animir/node-rate-limiter-flexible/wiki/MySQL)

For examples showing how to define and setup different cache types, see the section in the README.

There are other options that the `rate-limiter-flexible` library supports, but aren't implemented within this library
yet. Feel free to submit a PR adding support for those.

### points: number

This is the number of 'points' the user will be given per period. You can think of points as simply the number of
requests that a user can make in a set period.

The underlying library allows consuming a set amount of points per action, for instance maybe some actions a user can
take, might be more resource intensive, and therefor take up more 'points'.

By default we assume all requests consume 1 point. But this can be set using the `pointsConsumed` configuration option
or via the `@RateLimit` decorator.

### pointsConsumed: number

As mentioned above, you can consume more than 1 point per invocation of the rate limiter.

For instance if you have a limit of 100 points per 60 seconds, and `pointsConsumed` is set to 10, the user will
effectively be able to make 10 requests per 60 seconds.

### duration: number

This is the duration that the rate limiter will enforce the limit of `points` for.

This is defined in seconds, so a value of 60 will be 60 seconds.

### keyPrefix: string

This defines the prefix used for all storage methods listed in the `type` option.

This can be used to define different rate limiting rules to different routes/controllers.

When setting up `nestjs-rate-limiter`, you should make sure that any `keyPrefix` values are unique. If they are not
unique, then they will share the same rate limit.

For instance if you have the decorator on a controller, the `keyPrefix` will be the controllers name. If used on a
route, it will be a combination of the controllers name and the route functions name.


### errorMessage: string

The value that overrides error messages on Rate Limit exceptions.


# Examples

### With Redis

First you must install either the `redis` or `ioredis` package:

```bash
npm install --save redis
```

```bash
npm install --save ioredis
```

Then you must create a client (offline queue must be turned off) and pass it via the `storeClient` config option to
`RateLimiterModule.register`:

> app.module.ts

```ts
import * as redis from 'redis';
const redisClient = redis.createClient({ enable_offline_queue: false });

import * as Redis from 'ioredis';
const redisClient = new Redis({ enableOfflineQueue: false });

@Module({
    imports: [
        RateLimiterModule.register({
            type: 'Redis',
            storeClient: redisClient,
        }),
    ],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: RateLimiterInterceptor,
        },
    ],
})
export class ApplicationModule {}
```

### With Memcache

First you must install the `memcached` package:

```bash
npm install --save memcached
```

Then you must create a client and pass it via the `storeClient` config option to `RateLimiterModule.register`:

> app.module.ts

```ts
import * as Memcached from 'memcached';
const memcachedClient = new Memcached('127.0.0.1:11211');

@Module({
    imports: [
        RateLimiterModule.register({
            type: 'Memcached',
            storeClient: memcachedClient,
        }),
    ],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: RateLimiterInterceptor,
        },
    ],
})
export class ApplicationModule {}
```

### With Postgres

First you must install the `pg` package:

```bash
npm install --save pg
```

Then you must create a client and pass it via the `storeClient` config option to `RateLimiterModule.register`:

> app.module.ts

```ts
import { Pool } from 'pg';
const postgresClient = new Pool({
    host: '127.0.0.1',
    port: 5432,
    database: 'root',
    user: 'root',
    password: 'secret',
});

@Module({
    imports: [
        RateLimiterModule.register({
            type: 'Postgres',
            storeClient: postgresClient,
            tableName: 'rate_limiting', // not specifying this will create one table for each keyPrefix
        }),
    ],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: RateLimiterInterceptor,
        },
    ],
})
export class ApplicationModule {}
```

Note that this limiter also supports using [knex](https://knexjs.org/) or [sequelize](http://docs.sequelizejs.com/) with
an additional parameter as noted at
<https://github.com/animir/node-rate-limiter-flexible/wiki/PostgreSQL#sequelize-and-knex-support>.

### With MySQL

First you must install either the `mysql` or `mysql2` package:

```bash
npm install --save mysql
```

```bash
npm install --save mysql2
```

Then you must create a client and pass it via the `storeClient` config option to `RateLimiterModule.register`:

> app.module.ts

```ts
import * as mysql from 'mysql';

import * as mysql from 'mysql2';

const mysqlClient = mysql.createPool({
    connectionLimit: 100,
    host: 'localhost',
    user: 'root',
    password: 'secret',
});

@Module({
    imports: [
        RateLimiterModule.register({
            type: 'MySQL',
            storeClient: mysqlClient,
            dbName: 'ratelimits',
            tableName: 'rate_limiting', // not specifying this will create one table for each keyPrefix
        }),
    ],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: RateLimiterInterceptor,
        },
    ],
})
export class ApplicationModule {}
```

Note that this limiter also supports using [knex](https://knexjs.org/) or [sequelize](http://docs.sequelizejs.com/) with
an additional parameter as noted at
<https://github.com/animir/node-rate-limiter-flexible/wiki/MySQL#sequelize-and-knex-support>.

## TODO
- [ ] Fastify based Graphql Apps
- [ ] Websocket
- [ ] Rpc
- [ ] Tests & Github Actions (for automatic npm deployment on master branch)