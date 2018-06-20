// Express and Express Router
const express = require('express');

// Get command line options
const argv = require('minimist')(process.argv.slice(2));
const configFile = 'config' in argv ? argv.config : './builders.json';
const Convert = require('ansi-to-html');
const ansiConverter = new Convert();

// Get builder interface
const builder = require('../inc/builder');
builder.initialize(configFile);

module.exports = function (app) {
    const router = express.Router();
    // Home page
    router.get('/', function (req, res, next) {


        // Get all builders and output them
        let builders = builder.getBuilders();
        res.render('index', {title: 'Builbo', builders: builders, hasBuilders: !!Object.keys(builders).length});
    });


    app.io.on('connection', function (socket) {

        socket.on('get-builder-details', function (data) {
            let builderDetails = builder.getBuilder(data.builder_id);
            app.render(
                'templates/builder-details',
                {
                    builderDetails: builderDetails,
                    builder_id: data.builder_id,
                    layout: false,
                },
                function (error, renderedTemplate) {
                    socket.emit('builder-details', {renderedTemplate: renderedTemplate, builder_id: data.builder_id, builderDetails: builderDetails})
                }
            );
        });

        socket.on('attach-log', function (data) {

            let builder_id = data.builder_id;
            let builderProcess = builder.getBuilderProcess(builder_id);

            if (builderProcess.log.length) {
                builderProcess.log.forEach(function (logLine) {
                    socket.emit('builder-log-line', {logLine: logLine, builder_id: builder_id});
                });
            }

            builderProcess.stdout.on('data', (data) => {
                socket.emit('builder-log-line', {logLine: ansiConverter.toHtml(data.toString()), builder_id: builder_id});
            });

            builderProcess.stderr.on('data', (data) => {
                socket.emit('builder-log-line', {logLine: ansiConverter.toHtml(data.toString()), builder_id: builder_id});
            });

            builderProcess.on('close', (code) => {
                socket.emit('builder-log-line', {logLine: `Process closed with ${code}`, builder_id: builder_id});
                socket.emit('builder-deactivated', {builder_id: data.builder_id});
            });
        });

        socket.on('activate-builder', function (data) {
            builder.spawnBuilder(data.builder_id);
            socket.emit('builder-activated', {builder_id: data.builder_id});
        });

        socket.on('deactivate-builder', function (data) {
            builder.deactivateBuilder(data.builder_id);
            socket.emit('builder-deactivated', {builder_id: data.builder_id});
        });

    });

    return router;
};
