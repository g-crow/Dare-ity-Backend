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

app.post('/api/create_user', function(req, res){
  const {username, hashed_password, is_npo} = req.body;
  if(username === undefined || hashed_password === undefined || is_npo === undefined){
    res.json(JSON.stringify("Please fill empty fields."));
    res.end()
  }
  var queryString = "INSERT INTO user (name, password, is_npo) "
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
	pool.query("SELECT id, name, is_npo FROM user WHERE name = '" + username + "'", function(err, result){
    if(err){
			console.error("error", err.message);
		} else {
			res.json(JSON.stringify(result))
		}
  })
})

app.post('/api/create_dare', function(req, res){
  const {dare_title, dare_description, npo_creator} = req.body;
  if(dare_title === undefined || dare_description === undefined || npo_creator === undefined){
    res.json(JSON.stringify("Please fill empty fields."))
    res.end()
  }
  var queryString = "INSERT INTO dare (title, description, npo_creator) "
    + "VALUES ('" + dare_title + "', '" + dare_description + "', " + npo_creator + ")"
	pool.query(queryString, function(err, result){
    if(err){
			console.error("error", err.message)
		} else {
			res.json(JSON.stringify(result))
		}
  })
})

app.post('/api/fetch_dare', function(req, res){
	var id = req.body.id;
	var queryString = "SELECT id, title, description, npo_creator, expiration, total_pledge_amount FROM dare WHERE id = " + id
	pool.query(queryString, function(err, result){
    if(err){
			console.error("error", err.message)
		} else {
			res.json(JSON.stringify(result.rows[0]))
		}
  })
})

app.post('/api/create_client_dare', function(req, res){
  const {broadcaster_id, dare_id, npo_id} = req.body;
  if(broadcaster_id === undefined || dare_id === undefined || npo_id === undefined){
    res.json(JSON.stringify("Please fill empty fields."))
    res.end()
  }
  var queryString = "INSERT INTO client_dare (broadcaster_id, dare_id, npo_id, pledge_amount_threshold) "
    + "VALUES (" + broadcaster_id + ", " + dare_id + ", " + npo_id + ", (SELECT pledge_threshold FROM dare WHERE id = " + dare_id + "))"
	pool.query(queryString, function(err, result){
    if(err){
			console.error("error", err.message)
		} else {
			res.json(JSON.stringify(result) + "This Means Success")
		}
  })
})

app.post('/api/fetch_client_dare', function(req, res){
	var id = req.body.id;
	var queryString = "SELECT id, broadcaster_id, dare_id, pledge_amount_threshold, npo_id, pledge_status FROM user_dare WHERE id = " + id
	pool.query(queryString, function(err, result){
    if(err){
			console.error("error", err.message)
		} else {
			res.json(JSON.stringify(result.rows[0]))
		}
  })
})

// one delete route for all DB records - table name, id column name, and record id must be provided
app.post('/api/delete_record', function(req, res){
	const {table_name, id_var, id} = req.body;
	var queryString = "DELETE FROM " + table_name + " WHERE " + id_var + " = " + id
	pool.query(queryString, function(err, result){
    if(err){
			console.error("error", err.message)
		} else {
			res.json(result + "This Means Success")
		}
  })
})

app.listen(process.env.PORT || 3001);
