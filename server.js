var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var config = require('./config');
var jwt = require('jsonwebtoken');

app.get('*', function(req, res){
  res.json({server: 'up'})
})

app.listen(process.env.PORT || 3001);
