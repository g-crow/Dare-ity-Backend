var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var config = require('./config');
var jwt = require('jsonwebtoken');
var Pool = require('pg').Pool;
var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('dev'));

var config = {
  host: 'localhost',
  user: 'rebeccaking',
  password: 'sock8T0em!',
  database: 'dareity'
};
var pool = new Pool(config);

process.on('unhandledRejection', function(e) {
  console.log(e.message, e.stack)
})

app.get('*', function(req, res){
	pool.query('SELECT * FROM dareity_user', function(err, result){
    if(err){
			console.error("error",err.message);
		} else {
			res.json(JSON.stringify(result))
		}
  })
})

app.post('/api/fetch_user', function(req, res){
  var username = req.body.dareity_user;
	pool.query("SELECT user_id, name, is_npo FROM dareity_user WHERE name = '" + username + "'", function(err, result){
    if(err){
			console.error("error",err.message);
		} else {
			res.json(JSON.stringify(result))
		}
  })
})

app.listen(process.env.PORT || 3001);
