const jwt = require('jsonwebtoken');
const AuthProcessor = require('../processors/AuthenticationProcessor');

module.exports = function(req, res, next) {
    let token = req.headers['authorization'];
    let user = req.body.user;
    if(token != undefined && user != undefined){
      if (token.startsWith('Bearer ')) {
        // Remove Bearer from string
        token = token.slice(7, token.length);
      }
      var isValid = new AuthProcessor().isTokenValid(user, token);
      if(isValid){
        next();
      }
      else{
        res.statusCode = 401;
        res.send('You are unauthorized.');
      } 
    }
    else {
        res.statusCode = 401;
        res.send('You are unauthorized.');
    }
};