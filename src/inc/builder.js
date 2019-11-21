const fs = require('fs');
const path = require('path');
const {spawn, spawnSync} = require('child_process');
const kill = require('tree-kill');
const Convert = require('ansi-to-html');
const ansiConverter = new Convert();
const Linerstream = require('linerstream');

module.exports = {

    /**
     *
     */
    builders: {},

    /**
     *
     */
    processes: {},

    /**
     *
     * @param configFile
     */
    initialize: function(configFile) {
        this.builders = require(path.resolve(configFile));
        this.autoStart();
    },

    /**
     *
     */
    autoStart: function() {

        Object.keys(this.builders).forEach((builder_id) => {
            if (this.builders.hasOwnProperty(builder_id)) {
                if ('autostart' in this.builders[builder_id] && this.builders[builder_id].autostart) {
                    this.spawnBuilder(builder_id);
                }
            }
        });
    },

    /**
     *
     * @param builder_id
     * @returns {*}
     */
    getBuilder: function(builder_id) {
        return this.builders[builder_id] || false;
    },

    /**
     *
     * @param builder_id
     * @returns {*|boolean}
     */
    activateBuilder: function(builder_id) {
        if (builder_id in this.builders) {
            this.builders[builder_id].active = true;
            return true;
        }
    },

    /**
     *
     * @param builder_id
     * @returns {*}
     */
    deactivateBuilder: function(builder_id) {
        if (builder_id in this.builders) {

            // Kill the process
            if (builder_id in this.processes) {
                kill(this.processes[builder_id].pid);
                this.processes[builder_id].log = [];
                delete this.processes[builder_id];
            }

            // Mark as inactive
            this.builders[builder_id].active = false;

            return true;
        }
        return false;
    },

    /**
     *
     * @param builder_id
     * @returns {*}
     */
    spawnBuilder: function(builder_id) {

        // Mark as active
        if (!this.activateBuilder(builder_id)) {
            return false;
        }

        // Get the builder
        const builder = this.getBuilder(builder_id);

        // The path doesnt exist
        if (!fs.existsSync(builder.path)) {

            // Set active to false
            this.deactivateBuilder(builder_id);

            // Builder the message
            let errorMessage = `Builder path ${builder.path} for ${builder_id} does not exist`;

            // Log the message to console
            console.log(errorMessage);

            // Return the message for the frontend
            return errorMessage;
        }

        //
        try {

            // Log array
            let log = [];

            // Make sure our command is only yarn or npm
            if (['yarn', 'npm'].indexOf(builder.command) === -1) {
                return this.builderError(builder_id, `Only \`yarn\` or \`npm\` are allowed as command`);
            }

            // If we need to yarn install the dependencies
            if ('install' in builder && builder.install) {
                log.push(`Running ${builder.command} install for builder ${builder_id}`);
                spawnSync(builder.command, ['install'], {cwd: builder.path, shell: true, stdio: 'inherit'});
                log.push(`Finished running ${builder.command} install packages`);
            }

            // Spawn the builders process
            const builderProcess = spawn(builder.command, builder.args, {cwd: builder.path, shell: true});

            // Setup the newline splitters
            const outSplitter = new Linerstream();
            const errSplitter = new Linerstream();

            // Pipe the splitters
            builderProcess.stdout = builderProcess.stdout.pipe(outSplitter);
            builderProcess.stderr = builderProcess.stderr.pipe(errSplitter);

            // On stdout
            builderProcess.stdout.on('data', (data) => {
                let logLine = ansiConverter.toHtml(data.trim());
                // No empty log line
                if (logLine) {
                    log.push(logLine);
                    builderProcess.emit('log', {logLine: logLine});
                }
            });

            // On stderr
            builderProcess.stderr.on('data', (data) => {
                let logLine = ansiConverter.toHtml(data.trim());
                // No empty log line
                if (logLine) {
                    log.push(logLine);
                    builderProcess.emit('log', {logLine: logLine});
                }
            });

            // When the child process closes
            builderProcess.on('close', (code) => {
                let logLine = `BUILLY: ${builder_id} closed with code ${code}`;
                log.push(logLine);
                builderProcess.emit('log', {logLine: logLine});
                builderProcess.emit('builder-deactivated', {builder_id: builder_id});
                this.deactivateBuilder(builder_id);
            });

            // Clear the log every 20 minutes
            setInterval(() => {
                log = [];
                log.push(`BUILLY: 20 minute log rotation`);
            }, 60e3 * 20);

            // Set log
            builderProcess.log = log;

            // Set builderprocess to the holder
            this.processes[builder_id] = builderProcess;
        } catch (e) {

            // Error
            return this.builderError(builder_id, `Error spawning builder ${builder_id}, ${e}`);

        }

        return true;
    },

    /**
     *
     * @param builder_id
     * @param line
     */
    builderLogLine: function(builder_id, line) {

    },

    /**
     * TODO: Add a debug check
     * @param builder_id
     * @param message
     * @returns {*}
     */
    builderError: function(builder_id, message) {
        this.deactivateBuilder(builder_id);
        console.log(message);
        return message;
    },

    /**
     *
     * @param builder_id
     * @returns {boolean}
     */
    getBuilderProcess: function(builder_id) {
        return builder_id in this.processes ? this.processes[builder_id] : false;
    }

};
