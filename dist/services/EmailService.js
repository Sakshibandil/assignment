"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const sleep_1 = require("../utils/sleep");
class EmailService {
    constructor(providers, maxRetry = 3, rateLimit = 10, circuitBreaker, logger, emailQueue) {
        this.providers = providers;
        this.maxRetry = maxRetry;
        this.rateLimit = rateLimit;
        this.sentEmails = new Set();
        this.circuitBreaker = circuitBreaker;
        this.logger = logger;
        this.emailQueue = emailQueue;
    }
    async sendWithExponentialBackoff(email, providerIndex = 0) {
        const provider = this.providers[providerIndex];
        try {
            const response = await this.circuitBreaker.execute(() => provider.send(email));
            if (response.success) {
                return response;
            }
            else {
                throw new Error(response.error);
            }
        }
        catch (error) {
            this.logger.log(`Retrying with provider ${providerIndex + 1}`);
            const delay = Math.pow(2, this.maxRetry) * 1000;
            await (0, sleep_1.sleep)(delay);
            return this.fallback(email, providerIndex);
        }
    }
    async fallback(email, currentProviderIndex) {
        const nextProviderIndex = (currentProviderIndex + 1) % this.providers.length;
        if (nextProviderIndex !== currentProviderIndex) {
            this.logger.log(`Switching to provider ${nextProviderIndex + 1}`);
            return this.sendWithExponentialBackoff(email, nextProviderIndex);
        }
        else {
            return { success: false, error: 'All providers failed' };
        }
    }
    generateEmailId(email) {
        return `${email.to}-${email.subject}-${email.body}`;
    }
    isRateLimited() {
        return this.sentEmails.size >= this.rateLimit;
    }
    async sendEmail(email) {
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
    async processQueue() {
        while (!this.emailQueue.isEmpty()) {
            const email = this.emailQueue.dequeue();
            if (email) {
                const response = await this.sendEmail(email);
                this.logger.log(`Email sent to ${email.to}: ${response.success ? 'Success' : `Failed - ${response.error}`}`);
            }
        }
    }
}
exports.EmailService = EmailService;
