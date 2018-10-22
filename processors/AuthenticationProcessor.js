const jwt = require('jsonwebtoken');

var tokenHolder = function () {
    var instance;
    var tokenarray;
    function init() {
        if (tokenarray === undefined) {
            instance = this;
            tokenarray = [];
        }
        return instance;
    };
    function getTokens() {
        return tokenarray;
    };
    function setToken(username, token) {
        tokenarray[username] = token;
    };
    return {
        getInstance : function(){
            init();
        },
        getTokenforUser: function(username) {
            return getTokens()[username];
        },
        getAllToken: function() {
            return getTokens();
        },
        setToken: function(username, token) {
            setToken(username, token);
        }
    };
}();

module.exports = function () {
    tokenHolder.getInstance();
    const tokenSecret = 'secret'
    this.isTokenValid = function (username, token) {
        var userToken = tokenHolder.getTokenforUser(username);
        var validity = false;
        if (userToken != null && userToken == token) {
            jwt.verify(token, tokenSecret, function (err, decoded) {
                if (err || decoded.user != username || decoded.revoked) {
                    validity = false;
                } else {
                    validity = true;
                }
            });
        }
       return validity;
    }
    this.createToken = function(email, username){
        var token = jwt.sign({
            user : username,
            email : email,
            revoked : false
        },tokenSecret,{
            expiresIn: '1h'
        });
        tokenHolder.setToken(username,token);
        return token;
    }
}