var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    delete require.cache[require.resolve('../builders.json')];
    let builders = require('../builders.json');
    res.render('index', {title: 'Builbo', builders: builders});
});

module.exports = router;
