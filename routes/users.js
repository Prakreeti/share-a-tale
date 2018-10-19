const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
// to handle the profile image
var multer = require('multer');
var upload = multer({dest:'./uploads'});
var token_array = [];

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

router.post('/signup', upload.single('profile_image'), function(req, res) {
  let name = req.body.name;
  let email = req.body.email;
  let username = req.body.username;
  let password = req.body.password;
  if(req.file){
    var profile_image = req.file.filename;
  }else{
    var profile_image = 'noimage.jpeg';
  }

  // form validator
  req.checkBody('name', 'Name field is required').notEmpty();
  req.checkBody('email', 'Email field is required').notEmpty();
  req.checkBody('email', 'Email field is not valid').isEmail();
  req.checkBody('username', 'Username field is required').notEmpty();
  req.checkBody('password', 'Password field is required').notEmpty();
  req.checkBody('confirm_password', 'Passwords do not match').equals(req.body.confirm_password);

  // check errors
  let errors = req.validationErrors();
  if(errors){
    res.render('index', {errors: errors, title: 'SignUp', user: ''});
  }
  else{
    const user = new User({
      _id: new  mongoose.Types.ObjectId(),
      name: name,
      email: email,
      username: username,
      password: password,
      profile_image: profile_image,
      created_at: Date.now
    });

    User.createUser(user, function(err, user){
      if(err) throw err;
      console.log(err);
    });
    req.flash('success', 'You are now registered and can login');
    res.redirect('/#section-signin');
  }
});

router.post('/signin', function(req, res){
  User.findOne({username: req.body.username}, function(err, user){
    if(user == null){
      req.flash('error', 'Username is not valid');
      res.redirect('/#section-signin');
    }else{
      bcrypt.compare(req.body.password, user.password, function(err, result){
        if(!result) {
          req.flash('error', 'Wrong password entered');
          res.redirect('/#section-signin');
        }else{
          var JWTToken = jwt.sign({
            email: user.email,
            _id: user._id,
            status: 'active'
          },
          'secret',
          {
            expiresIn: '2h'
          });
          // user.token = JWTToken;
          // user.token_time = Date.now();
          username = user.username;
          user.save();
          token_array[username] = JWTToken;
          localStorage.setItem('token_array', token_array);
          res.send({token: JWTToken});
        }
      });
    }
  });
});

// route middleware to verify a token
router.use(function(req, res, next) {
  let token = req.headers['authorization'];
  console.log(token) ;
  if(token != undefined){
    if (token.startsWith('Bearer ')) {
      // Remove Bearer from string
      token = token.slice(7, token.length);
    }
    var user = req.body['header']['user'];
    // decode token
    if ( getToken(user)!= null && getToken(user)==token) {
      // verifies secret and checks exp
      jwt.verify(token, 'secret', function(err, decoded) {      
        if (err) {
          res.render('index', {errors: '', title: 'SignUp', user: ''});
        } else {
          // if everything is good, save to request for use in other routes
          req.decoded = decoded;    
          next();
        }
      });
    } else {
      req.flash('error', 'You need to sign in to access this page.');
      res.redirect('/#section-signin');
    }
  }
  else {
    req.flash('error', 'You need to sign in to access this page.');
    res.redirect('/#section-signin');
  }
});

router.get('/friends', function(req, res) {
  let token = getToken();
  User.findOne({'email': jwt.decode(token)['email']}, function(err, user) {
    if (err) throw err;
    User.find({}, function(err, friends) {
      if(err) throw err;
      res.render('friends', {title: 'Friends', user: user, friends: friends});
    });
  });
});

router.get('/logout', function (req, res) {
  localStorage.setItem('token', '');
  req.flash('success', 'You are now logged out.');
  res.redirect('/#section-signin');
});

var getToken = function(username){
  return localStorage.getItem('token_array')[username];
}

module.exports = router;
