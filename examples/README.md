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

# Examples to test
NOTE: To be flushed out in more detail.  TBD.  If this PR is approved will expand on this.
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

## inmemoryBlockOnConsumed

## queueEnabled and maxQueueSize

## WhiteList and blackList

## execEvenly and execEvenlyMinDelayMs