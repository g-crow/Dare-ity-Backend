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


var pool = new Pool(config);

process.on('unhandledRejection', function(e) {
  console.log(e.message, e.stack)
})

app.get('/api/test', function(req, res){
  res.json("this test works");
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

app.post('/api/create_dare', function(req, res){
  const {dare_title, dare_description, npo_creator} = req.body;
  if(dare_title === undefined || dare_description === undefined || npo_creator === undefined){
    res.json(JSON.stringify("Please fill empty fields."));
  }
  var queryString = "INSERT INTO dare (dare_title, dare_description, npo_creator) "
    + "VALUES ('" + dare_title + "', '" + dare_description + "', " + npo_creator + ")"
  pool.query(queryString, function(err, result){
    if(err){
      console.error("error", err.message);
    } else {
      res.json(JSON.stringify(result))
    }
  })
})


app.post('/api/create_user', function(req, res){
  // const {username, user_id, hashed_password, is_npo} = req.body;
  var username = req.body.user
  var user_id = req.body.user_id;
  var password = req.body.hashed_password;
  var is_npo = req.body.is_npo;
  if(username === undefined || user_id === undefined || hashed_password === undefined || is_npo === undefined){
    res.json(JSON.stringify("Please fill empty fields"));
  }
  var queryString = "INSERT INTO dareity_user (name, user_id, hashed_password, is_npo) "
    + "VALUES ('" + username + "', " + user_id + ", '" + hashed_password + "', " + is_npo + ")"
    console.log(queryString);
	pool.query(queryString, function(err, result){
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

var server = app.listen(process.env.PORT || 3001);
module.exports = server;
