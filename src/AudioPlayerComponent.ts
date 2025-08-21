import { BaseComponent } from './BaseComponent'
import audioPlayerTemplate from '@/audio-player.html?raw'

export default class AudioPlayerComponent extends BaseComponent {
    constructor() {
        super()
    }
    connectedCallback() {
        this.connectedCount++
        console.log('audio player component connected', this.connectedCount)
        const shadowRoot = this.attachShadow({ mode: 'open' })
        shadowRoot.innerHTML = audioPlayerTemplate
    }
}

customElements.define('audio-player-component', AudioPlayerComponent)