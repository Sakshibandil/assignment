"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockProvider2 = void 0;
class MockProvider2 {
    async send(email) {
        // Simulate sending logic, success rate of 70%
        const success = Math.random() > 0.3;
        return success
            ? { success: true }
            : { success: false, error: 'MockProvider2 failed to send email' };
    }
}
exports.MockProvider2 = MockProvider2;
