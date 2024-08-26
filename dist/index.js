"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MockProvider1_1 = require("./providers/MockProvider1");
const MockProvider2_1 = require("./providers/MockProvider2");
const EmailService_1 = require("./services/EmailService");
const CircuitBreaker_1 = require("./services/CircuitBreaker");
const Logger_1 = require("./services/Logger");
const SimpleQueue_1 = require("./services/SimpleQueue");
const emailQueue = new SimpleQueue_1.SimpleQueue();
const logger = new Logger_1.Logger();
const circuitBreaker = new CircuitBreaker_1.CircuitBreaker(3, 5000);
const emailService = new EmailService_1.EmailService([new MockProvider1_1.MockProvider1(), new MockProvider2_1.MockProvider2()], 3, 10, circuitBreaker, logger, emailQueue);
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
