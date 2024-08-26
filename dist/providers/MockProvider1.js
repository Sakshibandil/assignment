"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockProvider1 = void 0;
class MockProvider1 {
    async send(email) {
        // Simulate sending logic, success rate of 70%
        const success = Math.random() > 0.3;
        return success
            ? { success: true }
            : { success: false, error: 'MockProvider1 failed to send email' };
    }
}
exports.MockProvider1 = MockProvider1;
