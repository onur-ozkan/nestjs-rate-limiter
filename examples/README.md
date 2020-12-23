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

## Points, PointsConsumed, duration and blockDuration

## queueEnabled and maxQueueSize

## WhiteList and blackList
The whitelist and blacklist options are used to configure the rate limiter to allow and block requests based on the client's IP Address.  The controller that is used to demonstrate this is found in the following directory [BlackWhiteController] (https://github.com/ozkanonur/nestjs-rate-limiter/examples/apps/rate-limiter-express-app/src/app/controllers/blackwhite.controller.ts).  This controler contains 4 different scenarios that demonstrate both how whitelist and blacklisting of IP addresses works

The corresponding test case for this can be found in the following directory [BlackWhite Tests](https://github.com/ozkanonur/nestjs-rate-limiter/examples/libs/rate-limiter-points-test/src/lib/rate-limiter-blackwhite-test.ts)





## execEvenly and execEvenlyMinDelayMs