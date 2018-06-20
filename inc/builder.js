const fs = require('fs');
const path = require('path');
const {spawn, spawnSync} = require('child_process');
const kill = require('tree-kill');

const builderProcesses = {};

module.exports = {

    builderFile: null,
    initialize: function (configFile) {
        this.builderFile = path.resolve(configFile);
        this.deactivateAllBuilders();
    },
    getBuilders: function () {
        delete require.cache[this.builderFile];

        try {
            return require(this.builderFile);
        } catch (e) {
            return {};
        }
    },

    getBuilder: function (builder_id) {
        let builders = this.getBuilders();

        if (builder_id in builders) {
            return builders[builder_id];
        }

        return false;
    },

    saveBuilders: function (builders) {
        fs.writeFileSync(this.builderFile, JSON.stringify(builders, null, 4), {encoding: 'utf8', flag: 'w'});
        return true;
    },

    activateBuilder: function (builder_id) {
        let builders = this.getBuilders();
        if (builder_id in builders) {
            builders[builder_id].active = 1;
            return this.saveBuilders(builders);
        }
    },

    deactivateBuilder: function (builder_id) {
        let builders = this.getBuilders();
        if (builder_id in builders) {

            if (builder_id in builderProcesses) {
                kill(builderProcesses[builder_id].pid);
                delete builderProcesses[builder_id];
            }

            builders[builder_id].active = 0;
            return this.saveBuilders(builders);
        }
        return false;
    },

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

    spawnBuilder: function (builder_id) {
        if (!this.activateBuilder(builder_id)) {
            return false;
        }

        const builder = this.getBuilder(builder_id);

        if (builder.install) {
            console.log(`Running yarn install for builder ${builder_id}`);
            spawn('yarn', ['install'], {cwd: builder.path, shell: true, stdio: 'inherit'});
            console.log(`Finished installing packages`);
        }

        const builderProcess = spawn(builder.command, builder.args, {cwd: builder.path, shell: true});

        builderProcess.log = [];

        builderProcess.stdout.on('data', (data) => {
            builderProcess.log.push(data);
            process.stdout.write(data);
        });

        builderProcess.stderr.on('data', (data) => {
            builderProcess.log.push(data);
            process.stdout.write(data);
        });

        //
        builderProcess.on('close', (code) => {
            let msg = `BUILBO: ${builder_id} closed with code ${code}`;
            builderProcess.log.push(msg);
            process.stdout.write(msg);
            this.deactivateBuilder(builder_id);
        });

        // Clear the log every 60 minutes
        setInterval(() => {
            builderProcess.log = [];
            builderProcess.log.push(`BUILBO: Log cleared for performance reasons`);
        }, 60e3 * 60);

        builderProcesses[builder_id] = builderProcess;
    },

    getBuilderProcess: function (builder_id) {
        return builder_id in builderProcesses ? builderProcesses[builder_id] : false;
    }

};
