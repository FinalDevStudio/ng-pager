'use strict';

const express = require('express');
const app = express();

app.set('port', 8080);

app.use('/assets/', express.static('..'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/unit/index.html');
});

app.listen(app.get('port'), function () {
  console.log('Example app listening on port %s!', app.get('port'));
});