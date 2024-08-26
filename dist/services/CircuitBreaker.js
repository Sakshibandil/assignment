"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitBreaker = void 0;
class CircuitBreaker {
    constructor(failureThreshold, resetTimeout) {
        this.failureCount = 0;
        this.failureThreshold = failureThreshold;
        this.resetTimeout = resetTimeout;
        this.state = 'CLOSED';
        this.lastFailureTime = 0;
    }
    async execute(action) {
        if (this.state === 'OPEN' && Date.now() - this.lastFailureTime < this.resetTimeout) {
            return { success: false, error: 'Circuit breaker is open' };
        }
        try {
            const result = await action();
            this.failureCount = 0; // Reset failure count on success
            this.state = 'CLOSED';
            return result;
        }
        catch (error) {
            this.failureCount++;
            if (this.failureCount >= this.failureThreshold) {
                this.state = 'OPEN';
                this.lastFailureTime = Date.now();
            }
            return { success: false, error: 'Circuit breaker tripped' };
        }
    }
}
exports.CircuitBreaker = CircuitBreaker;
