import { Email, ProviderResponse, EmailProvider } from '../providers/EmailProvider';
import { CircuitBreaker } from './CircuitBreaker';
import { Logger } from './Logger';
import { SimpleQueue } from './SimpleQueue';
import { sleep } from '../utils/sleep';

export class EmailService {
    private providers: EmailProvider[];
    private maxRetry: number;
    private rateLimit: number;
    private sentEmails: Set<string>;
    private circuitBreaker: CircuitBreaker;
    private logger: Logger;
    private emailQueue: SimpleQueue;

    constructor(
        providers: EmailProvider[],
        maxRetry = 3,
        rateLimit = 10,
        circuitBreaker: CircuitBreaker,
        logger: Logger,
        emailQueue: SimpleQueue
    ) {
        this.providers = providers;
        this.maxRetry = maxRetry;
        this.rateLimit = rateLimit;
        this.sentEmails = new Set();
        this.circuitBreaker = circuitBreaker;
        this.logger = logger;
        this.emailQueue = emailQueue;
    }

    private async sendWithExponentialBackoff(
        email: Email,
        providerIndex: number = 0
    ): Promise<ProviderResponse> {
        const provider = this.providers[providerIndex];
        try {
            const response = await this.circuitBreaker.execute(() => provider.send(email));
            if (response.success) {
                return response;
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            this.logger.log(`Retrying with provider ${providerIndex + 1}`);
            const delay = Math.pow(2, this.maxRetry) * 1000;
            await sleep(delay);
            return this.fallback(email, providerIndex);
        }
    }

    private async fallback(email: Email, currentProviderIndex: number): Promise<ProviderResponse> {
        const nextProviderIndex = (currentProviderIndex + 1) % this.providers.length;
        if (nextProviderIndex !== currentProviderIndex) {
            this.logger.log(`Switching to provider ${nextProviderIndex + 1}`);
            return this.sendWithExponentialBackoff(email, nextProviderIndex);
        } else {
            return { success: false, error: 'All providers failed' };
        }
    }

    private generateEmailId(email: Email): string {
        return `${email.to}-${email.subject}-${email.body}`;
    }

    private isRateLimited(): boolean {
        return this.sentEmails.size >= this.rateLimit;
    }

    public async sendEmail(email: Email): Promise<ProviderResponse> {
        if (this.isRateLimited()) {
            this.logger.log('Rate limit exceeded');
            return { success: false, error: 'Rate limit exceeded' };
        }

        const emailId = this.generateEmailId(email);
        if (this.sentEmails.has(emailId)) {
            this.logger.log('Duplicate email detected');
            return { success: false, error: 'Duplicate email' };
        }

        const response = await this.sendWithExponentialBackoff(email);
        if (response.success) {
            this.sentEmails.add(emailId);
        }

        return response;
    }

    public async processQueue() {
        while (!this.emailQueue.isEmpty()) {
            const email = this.emailQueue.dequeue();
            if (email) {
                const response = await this.sendEmail(email);
                this.logger.log(
                    `Email sent to ${email.to}: ${response.success ? 'Success' : `Failed - ${response.error}`}`
                );
            }
        }
    }
}
