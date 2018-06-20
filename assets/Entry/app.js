import io from 'socket.io-client';
import '../Style/app.scss';
import { AppModule } from "../Lib/AppModule";


class BuilboFrontend extends AppModule {

    /**
     *
     */
    constructor() {
        super();
        this.socket = io.connect(window.location.origin);
        this.active_builder_id = null;

        this.socket.on('builder-details', (data) => {
            this.builderDetails(data);
        });
        this.socket.on('builder-activated', (data) => {
            this.attachLog(data.builder_id);
            this.builderIsActivated(data.builder_id);
        });
        this.socket.on('builder-deactivated', (data) => {
            this.builderIsDeactivated(data.builder_id);
        });
        this.socket.on('builder-log-line', (data) => {
            if (data.builder_id === this.active_builder_id || this.active_builder_id === null) {
                this.appendLogLine(data.logLine);
            }
        });

    }

    /**
     *
     * @constructor
     */
    DOMReady() {
        const self = this;

        let allBuilderSelectors = document.querySelectorAll('[data-select-builder]');
        allBuilderSelectors.forEach((builderSelectorDiv) => {
            builderSelectorDiv.addEventListener('click', function () {
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
        const self = this;
        this.active_builder_id = data.builder_id;
        let builderContainer = document.getElementById('builderContainer');
        builderContainer.innerHTML = data.renderedTemplate;

        let logContainer = document.getElementById('logContainer');
        this._clearLog();


        if (data.builderDetails.active) {
            this.attachLog(data.builder_id);
            logContainer.classList.remove('hidden');
        } else {
            logContainer.classList.add('hidden');
        }

        document.getElementById(`builderSwitch${data.builder_id}`).addEventListener('click', function () {
            if (this.checked) {
                self.activateBuilder(data.builder_id);
                logContainer.classList.remove('hidden');

            } else {
                self.deactivateBuilder(data.builder_id);
                logContainer.classList.add('hidden');
            }
        });
    }

    /**
     *
     * @param builder_id
     */
    activateBuilder(builder_id) {
        this.socket.emit('activate-builder', {builder_id: builder_id});
        this._clearLog();
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
        try {
            let stateLabel = document.getElementById(`stateLabel${builder_id}`);
            stateLabel.classList.remove('text-success');
            stateLabel.classList.add('text-danger');
            stateLabel.innerText = 'Offline';

            document.getElementById(`builderSwitch${builder_id}`).checked = false;
            document.getElementById(`builderSelector${builder_id}`).classList.remove('active');

        } catch (e) {

        }
    }

    /**
     *
     * @param builder_id
     */
    builderIsActivated(builder_id) {
        try {
            let stateLabel = document.getElementById(`stateLabel${builder_id}`);
            stateLabel.classList.remove('text-danger');
            stateLabel.classList.add('text-success');
            stateLabel.innerText = 'Online';
            document.getElementById(`builderSwitch${builder_id}`).checked = true;
            document.getElementById(`builderSelector${builder_id}`).classList.add('active');
        } catch (e) {

        }

    }

    /**
     *
     * @param builder_id
     */
    attachLog(builder_id) {
        this.socket.emit('attach-log', {builder_id: builder_id});
    }

    /**
     *
     * @param logLine
     */
    appendLogLine(logLine) {
        let logP = document.createElement('p');
        logP.innerHTML = logLine.trim();
        let logContainer = document.getElementById('logContainer');
        logContainer.appendChild(logP);
        logContainer.scrollTo(0, logContainer.scrollHeight);
    }

    /**
     *
     * @private
     */
    _clearLog() {
        let logContainer = document.getElementById('logContainer');
        logContainer.innerHTML = '';
    }

}

new BuilboFrontend();
