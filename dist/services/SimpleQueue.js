"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleQueue = void 0;
class SimpleQueue {
    constructor() {
        this.queue = [];
    }
    enqueue(email) {
        this.queue.push(email);
    }
    dequeue() {
        return this.queue.shift();
    }
    isEmpty() {
        return this.queue.length === 0;
    }
}
exports.SimpleQueue = SimpleQueue;
