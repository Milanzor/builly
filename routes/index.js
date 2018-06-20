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

module.exports = function (io) {
    const router = express.Router();
    // Home page
    router.get('/', function (req, res, next) {
        let builders = builder.getBuilders();
        res.render('index', {title: 'Builbo', builders: builders, hasBuilders: !!Object.keys(builders).length});
    });

    // Activate a builder
    router.get('/activate/:builder', function (req, res, next) {
        builder.spawnBuilder(req.params.builder);
        res.redirect('/');
    });

    // Deactivate a builder
    router.get('/deactivate/:builder', function (req, res, next) {
        builder.deactivateBuilder(req.params.builder);
        res.redirect('/');
    });

    // View a builder
    router.get('/view/:builder', function (req, res, next) {
        let currentBuilder = builder.getBuilder(req.params.builder);
        if (!currentBuilder) {
            res.status(404).send("Sorry can't find that!");
        } else {
            if (!currentBuilder.active) {
                builder.spawnBuilder(req.params.builder);
            }

            res.render('view', {title: 'Builbo', builder: JSON.stringify({id: req.params.builder}, null, 4)});
        }
    });

    io.on('connection', function (socket) {
        socket.on('get-builder-log', function (data) {
            let builderProcess = builder.getBuilderProcess(data.builder_id);

            if (builderProcess.log.length) {

                builderProcess.log.forEach(function (logLine) {
                    socket.emit('builder-log-line', ansiConverter.toHtml(logLine.toString()));
                });
            }

            builderProcess.stdout.on('data', (data) => {
                socket.emit('builder-log-line', ansiConverter.toHtml(data.toString()));
            });

            builderProcess.stderr.on('data', (data) => {
                socket.emit('builder-log-line', ansiConverter.toHtml(data.toString()));
            });

            builderProcess.on('close', (code) => {
                socket.emit('builder-log-line', `Process closed with ${code}`);
            });
        });

    });

    return router;
};
