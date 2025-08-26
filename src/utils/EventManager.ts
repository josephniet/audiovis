import { EVENT_NAMES } from "./Events";
import type { Event } from "./Events";

class EventBus extends EventTarget {
    private static instance: EventBus;

    private constructor() {
        super();
    }

    static getInstance(): EventBus {
        if (!EventBus.instance) {
            EventBus.instance = new EventBus();
        }
        return EventBus.instance;
    }
}

class EventManager {
    private eventTarget: EventTarget;
    constructor(element?: HTMLElement) {
        this.eventTarget = element || EventBus.getInstance();
    }

    on<T>(eventName: string, callback: (event: CustomEvent<T>) => void, options?: AddEventListenerOptions): void {
        this.eventTarget.addEventListener(eventName, callback as EventListener, options);
    }

    emit<T>(eventName: string, detail?: T): void {
        this.eventTarget.dispatchEvent(new CustomEvent<T>(eventName, { detail, bubbles: true }));
    }

    off<T>(eventName: string, callback: (event: CustomEvent<T>) => void, options?: AddEventListenerOptions): void {
        this.eventTarget.removeEventListener(eventName, callback as EventListener, options);
    }
}

export { EventManager };