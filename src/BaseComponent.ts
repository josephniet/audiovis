// Interface for components with readiness
interface ReadyComponent extends HTMLElement {
    ready: Promise<void>;
    readyState: 'pending' | 'resolved' | 'rejected';
}

export class BaseComponent extends HTMLElement implements ReadyComponent {
    protected connectedCount = 0
    public ready: Promise<void>
    public readyState: 'pending' | 'resolved' | 'rejected'
    protected resolveReady: (value?: unknown) => void
    protected rejectReady: (reason?: unknown) => void
    constructor() {
        super()
        this.readyState = 'pending'
        this.resolveReady = () => { }
        this.rejectReady = () => { }
        this.ready = new Promise<void>((resolve, reject) => {
            this.resolveReady = () => {
                if (this.readyState === 'pending') this.readyState = 'resolved'
                resolve()
            }
            this.rejectReady = (reason?: unknown) => {
                if (this.readyState === 'pending') this.readyState = 'rejected'
                reject(reason)
            }
        })
    }
    connectedCallback() {
    }
}