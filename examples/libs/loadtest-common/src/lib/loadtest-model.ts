export interface LoadTestResponse {
    totalRequests: number;
    totalErrors: number;
    totalTimeSeconds: number;
    rps: number;
    meanLatencyMs: number;
    maxLatencyMs: number;
    minLatencyMs: number;
    percentiles: any;
    errorCodes: NumberConstructor;
    instanceIndex: number;
}

export interface LoadTestOptions {
    url: string;
    maxRequests: number;
    maxSeconds: number;
    timeout: number;
    concurrency?: number;
}