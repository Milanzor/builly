const fs = require('fs');
const path = require('path');
const {spawn, spawnSync} = require('child_process');
const kill = require('tree-kill');

const builderProcesses = {};

module.exports = {

    builderFile: path.resolve(__dirname, '..', 'builders.json'),
    getBuilders: function () {
        delete require.cache[require.resolve('../builders.json')];

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

        return false
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
        Object.keys(builders).forEach((builder_id) => {
            this.deactivateBuilder(builder_id);
        });
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


        const builderProcess = spawn(builder.command, builder.args, {cwd: builder.path, shell: true, stdio: 'inherit'});

        builderProcess.on('close', (code) => {
            process.stdout.write(`BUILBO: ${builder_id} closed with code ${code}`);
            this.deactivateBuilder(builder_id);
        });

        builderProcesses[builder_id] = builderProcess;
    }

};
