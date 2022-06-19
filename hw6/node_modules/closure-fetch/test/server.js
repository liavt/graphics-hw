var express = require('express'),
    server = express(),
    bodyParser = require('body-parser');

var binary = 'R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';

server.get('/200', function (req, res) {
  res.status(200).send(new Buffer(binary, 'base64'));
});

server.post('/200', function (req, res) {
  res.status(200).send(new Buffer(binary, 'base64'));
});

server.get('/404', function (req, res) {
  res.status(404).send('not found');
});

server.post('/404', function (req, res) {
  res.status(404).send('not found');
});

server.post('/send', bodyParser.urlencoded({ extended: true }), function (req, res) {
  if (req.body && req.body['hello'] === 'world') {
    res.status(200).send('ok');
  } else {
    res.status(500).send('ok');
  }
});

server.use(express.static(process.cwd()));
server.listen(3003);
