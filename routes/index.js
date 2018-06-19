const express = require('express');
const router = express.Router();
const builder = require('../inc/builder');
builder.deactivateAllBuilders();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Builbo', builders: builder.getBuilders()});
});

/* GET activate builder. */
router.get('/activate/:builder', function (req, res, next) {
    builder.spawnBuilder(req.params.builder);
    res.redirect('/');
});

/* GET deactivate builder. */
router.get('/deactivate/:builder', function (req, res, next) {
    builder.deactivateBuilder(req.params.builder);
    res.redirect('/');
});

module.exports = router;
