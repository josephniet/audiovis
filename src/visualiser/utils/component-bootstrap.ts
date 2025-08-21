// Interface for components with readiness
export interface ReadyComponent extends HTMLElement {
    ready: Promise<void>;
    readyState: 'pending' | 'resolved' | 'rejected';
}