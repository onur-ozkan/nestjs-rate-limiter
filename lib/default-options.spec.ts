import { defaultRateLimiterOptions } from './default-options';

describe('defaultRateLimiterOptions', () => {
    it('should validate that defaultRateLimiterOptions exists', async () => {
        expect(defaultRateLimiterOptions).toBeDefined();
    });
});