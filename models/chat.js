const mongoose = require('mongoose');

const chatSchema = mongoose.Schema({
    to: String,
    from: String,
    chat: String
    
});

var Chat = mongoose.model('Chat', chatSchema);
module.exports = Chat;