const mongoose = require('mongoose');
let bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
   _id: mongoose.Schema.Types.ObjectId,
   email: {type: String, required: true},
   password: {type: String, required: true},
   username: {type: String, required: true},
   name: {type: String, required: true},
   profile_image: {type: String}
});

var User = mongoose.model('User', userSchema);
module.exports = User;

// method to create new user
module.exports.createUser = function(newUser, callback){
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(newUser.password, salt, function(err, hash) {
            // Store hash in your password DB.
            newUser.password = hash;
            newUser.save(callback);
        });
    });
}

