import { MockProvider2 } from '../src/providers/MockProvider2';

describe('MockProvider2', () => {
    let mockProvider2: MockProvider2;

    beforeEach(() => {
        mockProvider2 = new MockProvider2();
    });

    it('should send an email successfully', async () => {
        const response = await mockProvider2.send({
            to: 'test@example.com',
            subject: 'Test Email',
            body: 'This is a test email.'
        });
        expect(response.success).toBe(true);
    });

    it('should fail to send an email', async () => {
        jest.spyOn(global.Math, 'random').mockReturnValue(0.1);
        const response = await mockProvider2.send({
            to: 'test@example.com',
            subject: 'Test Email',
            body: 'This is a test email.'
        });
        expect(response.success).toBe(false);
    });
});
