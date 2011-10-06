// Dependencies
var app = require('http').createServer(handler)
  , sio = require('socket.io').listen(app)
  , fs  = require('fs')

app.listen(8080, function() {
  var addr = app.address();
  console.log('listening on http://' + addr.address + ':' + addr.port);
});

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

var clients = {};
sio.sockets.on('connection', function(socket) {
  var addr = socket.handshake.address.address + ':' + socket.handshake.address.port;
  socket.registered = false;
  
  socket.on('register', function() {
    socket.registered = true;
    if(!clients[addr]) {
      clients[addr] = socket;
      socket.emit('clients-up', clients);
      socket.broadcast.emit('clients-up', clients);
    }
  });
  
  socket.on('message', function(msg) {
    console.log(msg);
  })
  
  socket.on('disconnect', function() {
    delete clients[addr];
    socket.broadcast.emit('clients-up', clients);
  })
});