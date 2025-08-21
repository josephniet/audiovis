import { BaseComponent } from './BaseComponent'
import controlsTemplate from '@/controls.html?raw'

export default class ControlsComponent extends BaseComponent {
    constructor() {
        super()
    }
    connectedCallback() {
        this.connectedCount++
        console.log('controls component connected', this.connectedCount)
        const shadowRoot = this.attachShadow({ mode: 'open' })
        shadowRoot.innerHTML = controlsTemplate
    }
}
customElements.define('controls-component', ControlsComponent)