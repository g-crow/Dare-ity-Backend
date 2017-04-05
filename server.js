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

/*app.post('/api/create_user', function(req, res){
  const {username, user_id, hashed_password, is_npo} = req.body;
  if(username === undefined || user_id === undefined || hashed_password === undefined || is_npo === undefined){
    res.json(JSON.stringify("Please fill empty fields."));
  }
  var queryString = "INSERT INTO dareity_user (name, id, hashed_password, is_npo) "
    + "VALUES ('" + username + "', " + user_id + ", '" + hashed_password + "', " + is_npo + ")"
	pool.query(queryString, function(err, result){
    if(err){
			console.error("error", err.message);
		} else {
			res.json(JSON.stringify(result))
		}
  })
})*/

app.post('/api/create_user', function(req, res){
  const {username, hashed_password, is_npo} = req.body;
  if(username === undefined || hashed_password === undefined || is_npo === undefined){
    res.json(JSON.stringify("Please fill empty fields."));
  }
  var queryString = "INSERT INTO dareity_user (name, hashed_password, is_npo) "
    + "VALUES ('" + username + "', '" + hashed_password + "', " + is_npo + ")"
	pool.query(queryString, function(err, result){
    if(err){
			console.error("error", err.message);
		} else {
			res.json(JSON.stringify(result))
		}
  })
})

app.post('/api/fetch_user', function(req, res){
  var username = req.body.username;
	pool.query("SELECT id, name, is_npo FROM dareity_user WHERE name = '" + username + "'", function(err, result){
    if(err){
			console.error("error", err.message);
		} else {
			res.json(JSON.stringify(result))
		}
  })
})

app.post('/api/create_dare', function(req, res){
  const {title, user_id, hashed_password, is_npo} = req.body;
  if(username === undefined || user_id === undefined || hashed_password === undefined || is_npo === undefined){
    res.json(JSON.stringify("Please fill empty fields."));
  }
  var queryString = "INSERT INTO dareity_user (name, id, hashed_password, is_npo) "
    + "VALUES ('" + username + "', " + user_id + ", '" + hashed_password + "', " + is_npo + ")"
	pool.query(queryString, function(err, result){
    if(err){
			console.error("error", err.message);
		} else {
			res.json(JSON.stringify(result))
		}
  })
})

app.post('/api/fetch_dare', function(req, res){
  var id = req.body.id;
	pool.query("SELECT id, title, description, creator_id FROM dare WHERE id = " + id, function(err, result){
    if(err){
			console.error("error", err.message);
		} else {
			res.json(JSON.stringify(result))
		}
  })
})

app.listen(process.env.PORT || 3001);
