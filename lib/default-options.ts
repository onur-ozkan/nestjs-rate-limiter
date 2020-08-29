interface defaultOptions {
    for?: 'Express' | 'Fastify' | 'Microservice';
    type?: 'Memory' | 'Redis' | 'Memcache' | 'Postgres' | 'MySQL';
    points?: number,
    duration?: number,
    pointsConsumed?: number,
    errorMessage?: string
}
export const defaultRateLimiterOptions : defaultOptions  = {
    for: 'Express',
    type: 'Memory',
    points: 4,
    duration: 1,
    pointsConsumed: 1,
    errorMessage: 'Rate limit exceeded'
};
