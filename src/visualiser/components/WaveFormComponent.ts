import { VisualiserComponent } from './VisualiserComponent'
export class WaveFormComponent extends VisualiserComponent {
    constructor() {
        super()
    }

}

customElements.define('wave-form-component', WaveFormComponent)