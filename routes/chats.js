var express = require('express');
var router = express.Router();
const Chat = require('../models/chat');
const User = require('../models/user');
const AuthFilter = require('../filters/AuthenticationFilter');
// router.use(AuthFilter);

router.post("/save_chat", AuthFilter, async (req, res) => {
  try {
    var chat = new Chat(JSON.parse(req.body.chat));
    await chat.save();
    if(io.nsps["/"+chat.to] != undefined){
      io.nsps["/"+chat.to].emit('chatMessage', chat);
    }
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500);
    console.error(error);
  }
})

router.post("/fetch_chats", AuthFilter, (req, res) => {
  from = req.body.from;
  to = req.body.to;
  Chat.find({$or: [{'from': from, 'to': to},{'from': to, 'to': from}]}, (error, chats) => {
    res.send(chats)
  })
})

router.post("/show_chat_window", AuthFilter, (req, res) => {
  res.statusCode = '200';
  res.send('You are authorized.');
});

router.get("/display_chat_window", (req, res) => {
  username = req.query.user;
  User.findOne({ username: username }, function(err, user) {
    if(err) throw err;
    User.find({ username: { $ne: username } }, function(err, friends) {
      if(err) throw err;
      res.render('chat', {username: username, friends: friends, user: user});
    });
  });
});

module.exports = router;