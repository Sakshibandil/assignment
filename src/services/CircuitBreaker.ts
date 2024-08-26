import { ProviderResponse } from '../providers/EmailProvider';

export class CircuitBreaker {
    private failureCount: number;
    private failureThreshold: number;
    private resetTimeout: number;
    private state: 'CLOSED' | 'OPEN';
    private lastFailureTime: number;

    constructor(failureThreshold: number, resetTimeout: number) {
        this.failureCount = 0;
        this.failureThreshold = failureThreshold;
        this.resetTimeout = resetTimeout;
        this.state = 'CLOSED';
        this.lastFailureTime = 0;
    }

    public async execute(action: () => Promise<ProviderResponse>): Promise<ProviderResponse> {
        if (this.state === 'OPEN' && Date.now() - this.lastFailureTime < this.resetTimeout) {
            return { success: false, error: 'Circuit breaker is open' };
        }

        try {
            const result = await action();
            this.failureCount = 0; // Reset failure count on success
            this.state = 'CLOSED';
            return result;
        } catch (error) {
            this.failureCount++;
            if (this.failureCount >= this.failureThreshold) {
                this.state = 'OPEN';
                this.lastFailureTime = Date.now();
            }
            return { success: false, error: 'Circuit breaker tripped' };
        }
    }
}
