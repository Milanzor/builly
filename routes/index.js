// Express and Express Router
const express = require('express');
const router = express.Router();


// Get command line options
const argv = require('minimist')(process.argv.slice(2));
const configFile = 'config' in argv ? argv.config : './builders.json';

// Get builder interface
const builder = require('../inc/builder');
builder.initialize(configFile);

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

module.exports = router;
