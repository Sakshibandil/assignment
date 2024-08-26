import { Email } from '../providers/EmailProvider';

export class SimpleQueue {
    private queue: Email[] = [];

    enqueue(email: Email): void {
        this.queue.push(email);
    }

    dequeue(): Email | undefined {
        return this.queue.shift();
    }

    isEmpty(): boolean {
        return this.queue.length === 0;
    }
}
