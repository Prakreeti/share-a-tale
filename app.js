var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
let engine = require('ejs-locals');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var router = express.Router();
var chatsRouter = require('./routes/chats');
var session = require('express-session');
require('mongoose').connect('mongodb://localhost/sample_db');

namespacearray = [];
if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

var app = express();
var http = require("http").Server(app)

// view engine setup
app.engine('ejs', engine);
app.set('view engine', 'ejs');

// Handle sessions
app.use(session({
  secret: 'secret',
  saveUninitialized: true,
  resave: true
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// validator
var expressValidator = require('express-validator');
app.use(expressValidator({
  errorFormatter: function(param, msg, value){
    var namespace = param.split('.')
    , root = namespace.shift()
    , formParam = root;
    while(namespace.length){
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param: formParam,
      msg: msg,
      value: value
    };
  }
}));

// messages
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/chat',router);
app.use('/chats', chatsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// websocket connection establishment
io= require("socket.io")(http)
io.on("connection", (socket) => {
  console.log("Socket is connected...")
})


// router.post("/save_chat", async (req, res) => {
//     try {
//         var chat = new Chat(req.body);
//         await chat.save();
//         //Emit the event
//         //io.origins("localhost:3020");
//         res.sendStatus(200);
//         io.emit("customChats", req.body);
//     } catch (error) {
//         res.sendStatus(500);
//         console.error(error);
//     }
// })

// router.get("/fetch_chats", (req, res) => {
//     Chat.find({}, (error, chats) => {
//         res.send(chats)
//     })
// })

var server = http.listen(3040, () => {
  console.log("Well done, now I am listening on ", server.address().port)
})

module.exports.io = io;
module.exports = app;
