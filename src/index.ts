import { MockProvider1 } from './providers/MockProvider1';
import { MockProvider2 } from './providers/MockProvider2';
import { EmailService } from './services/EmailService';
import { CircuitBreaker } from './services/CircuitBreaker';
import { Logger } from './services/Logger';
import { SimpleQueue } from './services/SimpleQueue';

const emailQueue = new SimpleQueue();
const logger = new Logger();
const circuitBreaker = new CircuitBreaker(3, 5000);
const emailService = new EmailService(
    [new MockProvider1(), new MockProvider2()],
    3,
    10,
    circuitBreaker,
    logger,
    emailQueue
);

// Add emails to the queue
emailQueue.enqueue({
    to: 'user@example.com',
    subject: 'Test Email',
    body: 'This is a test email.'
});
emailQueue.enqueue({
    to: 'user2@example.com',
    subject: 'Test Email 2',
    body: 'This is another test email.'
});

// Process the queue
emailService.processQueue();
