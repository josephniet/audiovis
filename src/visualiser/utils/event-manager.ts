import { EventBus } from './event-bus';

export class EventManager {
    private eventTarget: EventTarget;

    constructor(element?: HTMLElement) {
        this.eventTarget = element || EventBus.getInstance();
    }

    on<T>(eventName: string, callback: (event: CustomEvent<T>) => void): void {
        this.eventTarget.addEventListener(eventName, callback as EventListener);
        // Delegate to EventBus for caching
        if (this.eventTarget === EventBus.getInstance()) {
            (this.eventTarget as EventBus).on<T>(eventName, callback);
        } else {
            this.eventTarget.addEventListener(eventName, callback as EventListener);
        }
    }

    emit<T>(eventName: string, detail: T): void {
        if (this.eventTarget === EventBus.getInstance()) {
            (this.eventTarget as EventBus).emit<T>(eventName, detail);
        } else {
            this.eventTarget.dispatchEvent(new CustomEvent<T>(eventName, { detail }));
        }
    }

    off<T>(eventName: string, callback: (event: CustomEvent<T>) => void): void {
        this.eventTarget.removeEventListener(eventName, callback as EventListener);
    }
}
