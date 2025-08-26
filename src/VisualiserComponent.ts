import visualiserTemplate from './visualiser.html?raw'
import visualiserCSS from './visualiser.css?raw'
import { BaseComponent } from './BaseComponent'
import { EventManager } from '@/utils/EventManager'
import { EVENT_NAMES } from '@/utils/Events'

export class VisualiserComponent extends BaseComponent {
    eventManager = new EventManager()
    constructor() {
        super()
        const shadowRoot = this.attachShadow({ mode: 'open' })
        shadowRoot.innerHTML = visualiserTemplate
        const style = document.createElement('style')
        style.textContent = visualiserCSS
        shadowRoot.appendChild(style)
    }
    connectedCallback(): void {
        console.log('visualiser component connected')
        this.eventManager.emit(EVENT_NAMES.REQUEST_AUDIO_PLAYER_DATA)
        this.eventManager.on(EVENT_NAMES.AUDIO_PLAYER_DATA, (event: CustomEvent<AudioPlayerData>) => {
            console.log('audio player data recieved by visualiser', event.detail)
        })
    }
}

customElements.define('visualiser-component', VisualiserComponent)