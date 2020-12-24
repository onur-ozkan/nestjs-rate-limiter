# Examples

The following is the examples directory for the nestjs-reate-limiter.  The following directory will contain a series of sample applications that demonstrate the different use cases of rate-limiter-express-app

# Documentation Map
- [Description](https://github.com/ozkanonur/nestjs-rate-limiter/examples#description)


# Description
The following is the examples directory for the nestjs-reate-limiter.  The following directory will contain a series of sample applications that demonstrate the different use cases of rate-limiter-express-app

## Rate Limiter Express App

### To start the Express Test App use the following command
```
nx serve rate-limiter-express-app
```

# Examples Controllers and test cases

## keyPrefix - multiple keyPrefix

The keyPrefix options are used to configure different rate limiter parameters for each module or endpoint.  If you are implementing different options for modules/endpoints, adding a ```prefix``` attribute will ensure that those options will only be associated to that endpoint.  The following is an example:

```
  @RateLimit({
    points: 1,
    duration: 3,
    errorMessage: 'Too many requests on the endpoint' })
  @Get('/global')
```

In the above decorator, the following rate limit options will be applied to the global prefix and thus to all endpoints (i.e. with the exception of those with a prefix).  If the decorator below, a prefix is defined and thus those options are applied to endpoints with that prefix

```
  @RateLimit({
    points: 5,
    duration: 3,
    keyPrefix: 'unique',
    errorMessage: 'Too many requests on the endpoint' })
  @Get('/unique')
```


## Points, PointsConsumed, duration and blockDuration

## queueEnabled and maxQueueSize

## WhiteList and blackList
The whitelist and blacklist options are used to configure the rate limiter to allow and block requests based on the client's IP Address.  The controller that is used to demonstrate this is found in the following directory [BlackWhiteController] (https://github.com/ozkanonur/nestjs-rate-limiter/examples/apps/rate-limiter-express-app/src/app/controllers/blackwhite.controller.ts).  This controler contains 4 different scenarios that demonstrate both how whitelist and blacklisting of IP addresses works

The corresponding test case for this can be found in the following directory [BlackWhite Tests](https://github.com/ozkanonur/nestjs-rate-limiter/examples/libs/rate-limiter-points-test/src/lib/rate-limiter-blackwhite-test.ts)





## execEvenly and execEvenlyMinDelayMs

The execute evenly ```execEvenly ``` indicates to the rate limiter to respond to the incoming requests in an even distrubtion over the duration.  As an example 
```
@RateLimit({
    points: 5,
    duration: 5,
    execEvenlyMinDelayMs: 200,
    execEvenly: true})
```

The above configuration will force the api to hold incoming requests and distribute the response evenly over the duration (i.e. 5 seconds).  It will attempt to respond to each request every 200 milliseconds.  

The controller that is used to demonstrate this is found in the following directory [ExecEvenlyController] (https://github.com/ozkanonur/nestjs-rate-limiter/examples/apps/rate-limiter-express-app/src/app/controllers/exec.controller.ts).  This controler contains 2 different scenarios that demonstrate both how the execEvenly 

The corresponding test case for this can be found in the following directory [Exec Evenly Tests](https://github.com/ozkanonur/nestjs-rate-limiter/examples/libs/rate-limiter-points-test/src/lib/rate-limiter-exec-evenly-test.ts)