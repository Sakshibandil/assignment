import { MockProvider1 } from '../src/providers/MockProvider1';

describe('MockProvider1', () => {
    let mockProvider1: MockProvider1;

    beforeEach(() => {
        mockProvider1 = new MockProvider1();
    });

    it('should send an email successfully', async () => {
        const response = await mockProvider1.send({
            to: 'test@example.com',
            subject: 'Test Email',
            body: 'This is a test email.'
        });
        expect(response.success).toBe(true);
    });

    it('should fail to send an email', async () => {
        jest.spyOn(global.Math, 'random').mockReturnValue(0.1);
        const response = await mockProvider1.send({
            to: 'test@example.com',
            subject: 'Test Email',
            body: 'This is a test email.'
        });
        expect(response.success).toBe(false);
    });
});
