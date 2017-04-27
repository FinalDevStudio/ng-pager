'use strict';

const favicon = require('serve-favicon');
const express = require('express');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

app.use(favicon(path.join(__dirname, 'favicon.ico')));
app.use('/assets/', express.static('assets'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/assets/index.html');
});

app.get('/api/count/items', (req, res) => {
  res.json(getRandomIntInclusive(10, 800));
});

server.listen(0, () => {
  console.log('E2E app listening on port %s!', server.address().port);
});
