const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
// to handle the profile image
var multer = require('multer');
var upload = multer({dest:'./uploads'});

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
    res.render('index', {errors: errors, title: 'SignUp'});
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
        console.log(req.body.password);
        console.log(result);
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
          user.token = JWTToken;
          user.token_time = Date.now();
          user.save();
          localStorage.setItem('token', JWTToken);
          res.redirect('/users/friends' );
        }
      });
    }
  });
});

// route middleware to verify a token
router.use(function(req, res, next) {
  let token = req.headers['x-access-token'] || req.headers['authorization'] || localStorage.getItem('token'); 
  if (token.startsWith('Bearer ')) {
    // Remove Bearer from string
    token = token.slice(7, token.length);
  }

  // decode token
  if (token) {
    // verifies secret and checks exp
    jwt.verify(token, 'secret', function(err, decoded) {      
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });    
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
});

router.get('/friends', function(req, res) {
  let token = getToken();
  User.findOne({'email': jwt.decode(token)['email']}, function(err, user) {
    if (err) throw err;
    res.render('friends', {title: 'Friends', user: user});
  });
});

router.get('/logout', function (req, res) {
  localStorage.setItem('token', '');
  req.flash('success', 'You are now logged out.');
  res.redirect('/#section-signin');
});

var getToken = function(){
  return localStorage.getItem('token');
}

module.exports = router;
