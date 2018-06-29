const fs = require('fs');
const path = require('path');
const {spawn, spawnSync} = require('child_process');
const kill = require('tree-kill');
const Convert = require('ansi-to-html');
const ansiConverter = new Convert();
const builderProcesses = {};
const Linerstream = require('linerstream');
module.exports = {

    /**
     *
     */
    builderFile: null,

    /**
     *
     * @param configFile
     */
    initialize: function (configFile) {
        this.builderFile = path.resolve(configFile);
        this.deactivateAllBuilders();
        this.autoStart();
    },

    /**
     *
     */
    autoStart: function () {
        let builders = this.getBuilders();

        Object.keys(builders).forEach((builder_id) => {
            if (builders.hasOwnProperty(builder_id)) {
                if ('autostart' in builders[builder_id] && builders[builder_id].autostart) {
                    this.spawnBuilder(builder_id);
                }
            }
        });
    },

    /**
     *
     * @returns {*}
     */
    getBuilders: function () {
        delete require.cache[this.builderFile];

        try {
            return require(this.builderFile);
        } catch (e) {
            return {};
        }
    },

    /**
     *
     * @param builder_id
     * @returns {*}
     */
    getBuilder: function (builder_id) {
        let builders = this.getBuilders();

        if (builder_id in builders) {
            return builders[builder_id];
        }

        return false;
    },

    /**
     *
     * @param builders
     * @returns {boolean}
     */
    saveBuilders: function (builders) {
        fs.writeFileSync(this.builderFile, JSON.stringify(builders, null, 4), {encoding: 'utf8', flag: 'w'});
        return true;
    },

    /**
     *
     * @param builder_id
     * @returns {*|boolean}
     */
    activateBuilder: function (builder_id) {
        let builders = this.getBuilders();
        if (builder_id in builders) {
            builders[builder_id].active = true;
            return this.saveBuilders(builders);
        }
    },

    /**
     *
     * @param builder_id
     * @returns {*}
     */
    deactivateBuilder: function (builder_id) {
        let builders = this.getBuilders();
        if (builder_id in builders) {

            if (builder_id in builderProcesses) {
                kill(builderProcesses[builder_id].pid);
                builderProcesses[builder_id].log = [];
                delete builderProcesses[builder_id];
            }

            builders[builder_id].active = false;
            return this.saveBuilders(builders);
        }
        return false;
    },

    /**
     *
     * @returns {*}
     */
    deactivateAllBuilders: function () {
        const builders = this.getBuilders();

        if (Object.keys(builders).length === 0) {
            return this.saveBuilders({});
        }

        Object.keys(builders).forEach((builder_id) => {
            this.deactivateBuilder(builder_id);
        });

        return true;
    },

    /**
     *
     * @param builder_id
     * @returns {*}
     */
    spawnBuilder: function (builder_id) {

        if (!this.activateBuilder(builder_id)) {
            return false;
        }

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

            // If we need to yarn install the dependencies
            if ('install' in builder && builder.install) {
                log.push(`Running yarn install for builder ${builder_id}`);
                spawnSync('yarn', ['install'], {cwd: builder.path, shell: true, stdio: 'inherit'});
                log.push(`Finished running yarn install`);
            }

            // Make sure our command is only yarn or npm
            if (['yarn', 'npm'].indexOf(builder.command) === -1) {
                return this.builderError(builder_id, `Only \`yarn\` or \`npm\` are allowed as commands, builder ${builder_id} wants to execute \`${builder.command}\``);
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
            builderProcesses[builder_id] = builderProcess;
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
    builderLogLine: function (builder_id, line) {

    },

    /**
     * TODO: Add a debug check
     * @param builder_id
     * @param message
     * @returns {*}
     */
    builderError: function (builder_id, message) {
        this.deactivateBuilder(builder_id);
        console.log(message);
        return message;
    },

    /**
     *
     * @param builder_id
     * @returns {boolean}
     */
    getBuilderProcess: function (builder_id) {
        return builder_id in builderProcesses ? builderProcesses[builder_id] : false;
    }

};
