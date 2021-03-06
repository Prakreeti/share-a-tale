const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const AuthProcessor = require('../processors/AuthenticationProcessor');
const NamespaceProcessor = require('../processors/NamespaceProcessor');

// to handle the profile image
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({storage});

router.post('/signup', upload.single('profile_image'), function(req, res) {
  let name = req.body.name;
  let email = req.body.email;
  let username = req.body.username;
  let password = req.body.password;
  if(req.file){
    // var profile_image = req.file.toString('base64')
    var profile_image = req.file.buffer.toString('base64');
  }else{
    var profile_image = '';
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
    res.redirect('/signin');
  }
});

router.get('/signin', function(req, res, next) {
  res.render('signin', {username: ''});
}); 

router.get('/signup', function(req, res, next) {
  res.render('signup', {username: '', errors: ''});
});

router.post('/signin', function(req, res){
  User.findOne({username: req.body.username}, function(err, user){
    if(user == null){
      req.flash('error', 'Username is not valid');
      res.redirect('/signin');
    }else{
      bcrypt.compare(req.body.password, user.password, function(err, result){
        if(!result) {
          req.flash('error', 'Wrong password entered');
          res.redirect('/signin');
        }else{
          username = user.username;
          var JWTToken = new AuthProcessor().createToken(user.email, username);
          user.save();

          // create namespace for user
          createNameSpace(username);
          res.send({token: JWTToken});
        }
      });
    }
  });
});

router.get('/profile/:username', function(req, res, next) {
  var username = request.params.username;
  console.log(username);
  // findUserByUsername(username, function(error, user) {
  //   if (error) return next(error);
  //   return response.render('admin', user);
  // });
}); 

var createNameSpace = function(username){
  NamespaceProcessor.createNameSpace(username);
};

module.exports = router;
