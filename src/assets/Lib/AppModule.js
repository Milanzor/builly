// Get DefaultModule
import { DefaultModule } from 'stein';

/**
 *
 */
export class AppModule extends DefaultModule {
    constructor(modules) {
        super();

        // Subscribe DOMReady functions to the DOMReady event
        if (typeof this.DOMReady === 'function') {
            this.subscribe('DOMReady', this.DOMReady);
        }

        // on DOMContentLoaded, publish DOMReady
        document.addEventListener('DOMContentLoaded', () => this.publish('DOMReady'));

    }

}
