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
          var n = text.search("neu ai noi:");
          var m = text.search("thi e tra loi la:");
          if(n > -1){
            var hoi = text.substring(n+12,m);
          }
          if(m > -1){
            var dap = text.substring(m+18,text.length);
          }
          sendMessage(senderId,n+hoi+m+dap);
          //--------------- function insert document to database
          var insertDocuments = function(db, callback) {
            // Get the documents collection
            var collection = db.collection('user');
            // Insert some documents
            collection.insertMany([
              {"hoi" : hoi, "dap" : dap }
            ], function(err, result) {
              assert.equal(err, null);
              assert.equal(1, result.result.n);
              assert.equal(1, result.ops.length);
              sendMessage(senderId,"e nho roi");
              callback(result);
            });
          }
          //-------------------function query database
          var findDocuments = function(db, callback) {
            // Get the documents collection
            var collection = db.collection('user');
            // Find some documents
            sendMessage(senderId, "Em_iu: vao trong user collection ");
            collection.find({'name': 'teo'}).toArray(function(err, docs) {
              assert.equal(err, null);
              console.log("Found the following records");
              console.log(docs);
              callback(docs);
            });      
          }
          sendMessage(senderId,text);
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
