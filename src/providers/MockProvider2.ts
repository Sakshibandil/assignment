import { Email, ProviderResponse, EmailProvider } from './EmailProvider';

export class MockProvider2 implements EmailProvider {
    async send(email: Email): Promise<ProviderResponse> {
        // Simulate sending logic, success rate of 70%
        const success = Math.random() > 0.3;
        return success
            ? { success: true }
            : { success: false, error: 'MockProvider2 failed to send email' };
    }
}
