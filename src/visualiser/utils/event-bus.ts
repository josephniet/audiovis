import { EVENT_NAMES } from './events';
interface CachedEvent {
    name: string;
    detail: any;
}

export class EventBus extends EventTarget {
    private static instance: EventBus;
    private eventCache: Map<string, CachedEvent> = new Map();

    private constructor() {
        super();
    }

    static getInstance(): EventBus {
        if (!EventBus.instance) {
            EventBus.instance = new EventBus();
        }
        return EventBus.instance;
    }

    emit<T>(eventName: string, detail: T): void {
        // Cache critical events
        if ([EVENT_NAMES.DURATION_UPDATE].includes(eventName)) {
            this.eventCache.set(eventName, { name: eventName, detail });
            console.log('cached event', eventName, detail)
        }
        this.dispatchEvent(new CustomEvent<T>(eventName, { detail }));
    }

    on<T>(eventName: string, callback: (event: CustomEvent<T>) => void): void {
        this.addEventListener(eventName, callback as EventListener);
        // Replay cached event if it exists
        const cachedEvent = this.eventCache.get(eventName);
        if (cachedEvent) {
            callback(new CustomEvent<T>(eventName, { detail: cachedEvent.detail }));
        }
    }
}