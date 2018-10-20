var express = require('express');
var router = express.Router();
const Chat = require('../models/chat');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

router.post("/save_chat", async (req, res) => {
    try {
        var chat = new Chat(req.body);
        await chat.save();
        //Emit the event
        io.emit("chat_" + chat.to, req.body);
        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500);
        console.error(error);
    }
})

router.get("/fetch_chats", (req, res) => {
    Chat.find({}, (error, chats) => {
        res.send(chats)
    })
})

router.get("/show_chat_window", (req, res) => {
    console.log(req.body);
    res.render('chat'); 
})


module.exports = router;