const mongoose = require('mongoose');

const chatSchema = mongoose.Schema({
    name: String,
    chat: String
});

var Chat = mongoose.model('Chat', chatSchema);
module.exports = Chat;