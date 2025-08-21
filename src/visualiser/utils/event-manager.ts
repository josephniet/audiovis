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

    on<T>(eventName: string, callback: (event: CustomEvent<T>) => void): void {
        this.eventTarget.addEventListener(eventName, callback as EventListener);
    }

    emit<T>(eventName: string, detail?: T): void {
        this.eventTarget.dispatchEvent(new CustomEvent<T>(eventName, { detail, bubbles: true }));
    }

    off<T>(eventTarget: string, callback: (event: CustomEvent<T>) => void): void {
        this.element.removeEventListener(eventName, callback as EventListener);
    }
}

export { EventManager };