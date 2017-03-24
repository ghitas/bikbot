// # SimpleServer
// A simple chat bot server
var logger = require('morgan');
var http = require('http');
var bodyParser = require('body-parser');
var express = require('express');
var router = express();

var app = express();
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
var server = http.createServer(app);
var request = require("request");

app.get('/', (req, res) => {
  res.send("Home page. Server running okay.");
});

// Đây là đoạn code để tạo Webhook
app.get('/webhook', function(req, res) {
  if (req.query['hub.verify_token'] === 'bik_bot') {
    res.send(req.query['hub.challenge']);
  }
  res.send('Error, wrong validation token');
});//
// Xử lý khi có người nhắn tin cho bot
app.post('/webhook', function(req, res) {
  var entries = req.body.entry;
  for (var entry of entries) {
    var messaging = entry.messaging;
    for (var message of messaging) {
      var senderId = message.sender.id;
      if (message.message) {
        // If user send text
        if (message.message.text) {
          var text = message.message.text;
          console.log(text); // In tin nhắn người dùng
          switch(text){
            case 'em la ai':
              text = 'em la gau cua a Thanh`';break;
            case 'em yeu ai':
              text = 'em yeu a Thanh';break;
            case 'em ten gi':
              text = 'em ten Bi Mat';break;
            case 'xao xao':
              text = 'em noi thiet ma';break;
            case 'ket noi mongodb cho a':
              sendMessage(senderId, "Em_iu: case chuan form ");
              var MongoClient = require('mongodb').MongoClient, assert = require('assert');
              // Connection URL
              sendMessage(senderId, "Em_iu: khoi tao MongoClient ");
              var url = 'mongodb://thanh:123456@ds137760.mlab.com:37760/bikbot_database';
              // Use connect method to connect to the server
              MongoClient.connect(url, function(err, db) {
                  assert.equal(null, err);
                sendMessage(senderId, "Em_iu: ket noi thanh cong ");
                  //console.log("Connected successfully to server");
                  text = "Connected successfully to server!! ket noi roi do a";
                  db.close();
                sendMessage(senderId, "Em_iu: dong ket noi ");
               });
              break;
            default:
              text = message.message.text;break;
          };
          sendMessage(senderId, "Em_iu: " + text);
        }
      }
    }
  }

  res.status(200).send("OK");
});


// Gửi thông tin tới REST API để trả lời
function sendMessage(senderId, message) {
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {
      access_token: "EAACyCMDOomYBANF4qJzT8MWasj4ircQ30S2Pjco7pAkCATxZALWgOpgD22m1uDkArS7YaKhjSwwMsz3CP1i3tzUix9Wlu8uMr1J0pbs5Ws9SlyE0HNr1qufslpvUZC3LnQabRVcMe235mLEZBTudFfZA9WAtavEp4iQME3adewZDZD",
    },
    method: 'POST',
    json: {
      recipient: {
        id: senderId
      },
      message: {
        text: message
      },
    }
  });
}

app.set('port', process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 3000);
app.set('ip', process.env.OPENSHIFT_NODEJS_IP || process.env.IP || "0.0.0.0");

server.listen(app.get('port'), app.get('ip'), function() {
  console.log("Chat bot server listening at %s:%d ", app.get('ip'), app.get('port'));
});
