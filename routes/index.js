var express = require('express');
var router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('++++++++++');
  console.log(req.cookies);
  res.render('index', { title: 'Tell-A-tale', errors: [], username: ''});
});

router.get('/chat', function(req, res, next) {
  res.render('chat');
});

router.get('/about', function(req, res, next) {
  res.render('about', { username: '' });
});

router.get('/contact', function(req, res, next) {
  res.render('contact', { username: '' });
});

module.exports = router;
