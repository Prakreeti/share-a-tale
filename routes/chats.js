var express = require('express');
var router = express.Router();
const Chat = require('../models/chat');

router.post("/save_chat", async (req, res) => {
    try {
        var chat = new Chat(req.body);
        await chat.save();
        //Emit the event
        io.emit("chat", req.body);
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

module.exports = router;