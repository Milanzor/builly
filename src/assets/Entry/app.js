import io from 'socket.io-client';
import '../Style/app.scss';
import { AppModule } from "../Lib/AppModule";
import { Snackbar } from 'daemonite-material-additions';
import Log from '../Lib/Log';
import Favicon from '../Lib/Favicon';
import PurpleFaviconImage from '../Images/purple-favicon.png';
import RedFaviconImage from '../Images/red-favicon.png';

class BuillyFrontend extends AppModule {

    /**
     *
     */
    constructor() {
        super();
        this.socket = io.connect(window.location.origin);
        this.active_builder_id = null;
        this.attached_logs = [];

        // Socket events
        this.socket.on('builder-details', (data) => {
            this.builderDetails(data);
        });

        this.socket.on('builder-activated', (data) => {
            this.attachLog();
            this.builderIsActivated(data.builder_id);
        });

        this.socket.on('builder-deactivated', (data) => {
            this.builderIsDeactivated(data.builder_id);
            if (this.active_builder_id === data.builder_id) {
                this.Favicon.blink(RedFaviconImage, 2000);
            }
        });

        this.socket.on('builder-log-line', (data) => {
            let flush = ('flush' in data && data.flush);
            if (data.builder_id === this.active_builder_id || flush) {
                this.Log.appendLine(data.logLine);
                if (!flush) {
                    this.Favicon.blink(PurpleFaviconImage, 1500);
                }
            }
        });

        this.socket.on('builder-error', (data) => {
            this.builderError(data.message);
        });

    }

    /**
     *
     * @constructor
     */
    DOMReady() {
        // Initialize the LogInterface
        this.Log = new Log;

        // Initialize the Favicon changer
        this.Favicon = new Favicon;

        const self = this;

        // Bind the builder selectors
        let allBuilderSelectors = document.querySelectorAll('[data-select-builder]');
        allBuilderSelectors.forEach((builderSelectorDiv) => {

            builderSelectorDiv.addEventListener('click', function () {

                if (this.classList.contains('opened')) {
                    return false;
                }

                self.socket.emit('get-builder-details', {builder_id: this.getAttribute('data-select-builder')});

                allBuilderSelectors.forEach(function (el) {
                    el.classList.remove('opened');
                });

                this.classList.add('opened');
            });
        });
    }

    /**
     *
     * @param data
     */
    builderDetails(data) {


        // Context
        const self = this;

        // Set the active builder
        this.active_builder_id = data.builder_id;

        document.title = 'Builly | ' + data.builder_id;

        // Render the template inside the builderContainer
        let builderContainer = document.getElementById('builderContainer');
        builderContainer.innerHTML = data.renderedTemplate;

        // Clear the log
        this.Log.clear();

        // If the requested builder is active, attach the log
        if (data.builderDetails.active) {
            this.attachLog();
            this.Log.show();
        } else {
            this.Log.hide();
        }

        // Bind click on spawning the builder
        document.getElementById(`builderSwitch${data.builder_id}`).addEventListener('click', function () {
            if (this.checked) {
                self.activateBuilder(data.builder_id);
            } else {
                self.deactivateBuilder(data.builder_id);
                self.Log.hide();
            }
        });
    }

    /**
     *
     * @param builder_id
     */
    activateBuilder(builder_id) {
        this.socket.emit('activate-builder', {builder_id: builder_id});
        this.Log.clear();
    }

    /**
     *
     * @param builder_id
     */
    deactivateBuilder(builder_id) {
        this.socket.emit('deactivate-builder', {builder_id: builder_id});
    }

    /**
     *
     * @param builder_id
     */
    builderIsDeactivated(builder_id) {
        this.attached_logs.splice(this.attached_logs.indexOf(builder_id), 1);

        let builderSelector = document.getElementById(`builderSelector${builder_id}`);
        if (builderSelector) {
            builderSelector.classList.remove('active');
        }

        let builderSwitcher = document.getElementById(`builderSwitch${builder_id}`);
        if (builderSwitcher) {
            builderSwitcher.checked = false;
        }

    }

    /**
     *
     * @param builder_id
     */
    builderIsActivated(builder_id) {

        // If we're looking at the active builder when activate
        if (this.active_builder_id === builder_id) {
            this.Log.show();

            let builderSelector = document.getElementById(`builderSelector${builder_id}`);
            if (builderSelector) {
                builderSelector.classList.add('active');
            }

            let builderSwitcher = document.getElementById(`builderSwitch${builder_id}`);
            if (builderSwitcher) {
                builderSwitcher.checked = true;
            }
        }

    }

    /**
     *
     */
    attachLog() {
        this.socket.emit('fetch-log', {builder_id: this.active_builder_id});
        if (this.attached_logs.indexOf(this.active_builder_id) === -1) {
            this.socket.emit('attach-log', {builder_id: this.active_builder_id});
            this.attached_logs.push(this.active_builder_id);
        }
    }

    builderError(message) {
        Snackbar.render({
            html: message
        });
    }

}

new BuillyFrontend();
