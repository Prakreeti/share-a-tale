var express = require('express');
var router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');

/* GET home page. */
router.get('/', function(req, res, next) {
  let token = getToken();
  if (token) {
    // verifies secret and checks exp
    jwt.verify(token, 'secret', function(err, decoded) {      
      if (err) {
        res.render('index', { title: 'Tell-A-tale', errors: [], user: ''});
      }
      else{
        User.findOne({'email': jwt.decode(token)['email']}, function(err, user) {
          if (err){
            res.render('index', { title: 'Tell-A-tale', errors: [], user: ''});
          }
          res.render('index', { title: 'Tell-A-tale', errors: [], user: user});
        });
      }
    });
  }
  else{
    res.render('index', { title: 'Tell-A-tale', errors: [], user: ''});
  }
});

router.get('/chat', function(req, res, next) {
  res.render('chat', { title: 'Express' });
});

var getToken = function(){
  return localStorage.getItem('token');
}

module.exports = router;
