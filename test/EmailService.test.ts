import { MockProvider1 } from '../src/providers/MockProvider1';
import { MockProvider2 } from '../src/providers/MockProvider2';
import { EmailService } from '../src/services/EmailService';
import { CircuitBreaker } from '../src/services/CircuitBreaker';
import { Logger } from '../src/services/Logger';
import { SimpleQueue } from '../src/services/SimpleQueue';

describe('EmailService', () => {
    let emailService: EmailService;
    let mockProvider1: MockProvider1;
    let mockProvider2: MockProvider2;
    let circuitBreaker: CircuitBreaker;
    let logger: Logger;
    let emailQueue: SimpleQueue;

    beforeEach(() => {
        mockProvider1 = new MockProvider1();
        mockProvider2 = new MockProvider2();
        circuitBreaker = new CircuitBreaker(3, 5000);
        logger = new Logger();
        emailQueue = new SimpleQueue();
        emailService = new EmailService(
            [mockProvider1, mockProvider2],
            3,
            10,
            circuitBreaker,
            logger,
            emailQueue
        );
    });

    it('should send an email successfully', async () => {
        const response = await emailService.sendEmail({
            to: 'test@example.com',
            subject: 'Test Email',
            body: 'This is a test email.'
        });
        expect(response.success).toBe(true);
    });

    it('should handle fallback to another provider', async () => {
        // Simulate failure of the first provider
        jest.spyOn(mockProvider1, 'send').mockResolvedValue({ success: false });
        const response = await emailService.sendEmail({
            to: 'test@example.com',
            subject: 'Test Email',
            body: 'This is a test email.'
        });
        expect(response.success).toBe(true);
    });

    it('should respect rate limiting', async () => {
        for (let i = 0; i < 10; i++) {
            emailService.sendEmail({
                to: `test${i}@example.com`,
                subject: `Test Email ${i}`,
                body: 'This is a test email.'
            });
        }
        const response = await emailService.sendEmail({
            to: 'test11@example.com',
            subject: 'Test Email 11',
            body: 'This is a test email.'
        });
        expect(response.success).toBe(false);
        expect(response.error).toBe('Rate limit exceeded');
    });
});
