const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const config = require('./config');
const jwt = require('jsonwebtoken');
const User = require('./server/models/user');
const usercontroller = require('./server/controllers/userController');
const { requireLogin } = require('./server/models/user')

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(morgan('dev'));

const db = require('./db')

const pg = require('pg')
//this initializes a connection db
//it will keep idle connections open for 30 seconds
//and set a limit of maximum 10 idle clients

let client;

pg.defaults.ssl = true;
pg.connect(process.env.DATABASE_URL || config.db, function(err, _client) {
  if (err) throw err;
    console.log('Connecting to database')
    client = _client
});

app.use((req, res, next) => { 
  req.query = client.query;
  next();
})






//API Routes
var apiRoutes = express.Router();

app.get('/', function(req, res) {
  res.json({ message: 'Dare-ity api launched!' });
});

app.use('/api', apiRoutes);

//POST
apiRoutes.post('/create_user', usercontroller.createuser);
apiRoutes.post('/authenticate', usercontroller.authenticate);

app.post('/api/fetch_user', function(req, res){
  var username = req.body.username;
  db.query("SELECT id, name, is_npo FROM user WHERE name = '" + username + "'", function(err, result){
    if(err){
      console.error("error", err.message);
    } else {
      res.json(result)
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
	db.query(queryString, function(err, result){
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
	db.query(queryString, function(err, result){
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
	db.query(queryString, function(err, result){
    if(err){
			console.error("error", err.message)
		} else {
			res.json(JSON.stringify(result) + "This Means Success")
		}
  })
})

app.post('/api/fetch_user_dare', function(req, res){
	var id = req.body.id;
	var queryString = "SELECT id, broadcaster_id, dare_id, pledge_amount_threshold, npo_id, pledge_status FROM user_dare WHERE id = " + id
	db.query(queryString, function(err, result){
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
	db.query(queryString, function(err, result){
    if(err){
			console.error("error", err.message)
		} else {
			res.json(result + "This Means Success")
		}
  })
})

app.listen(process.env.PORT || 3001);
console.log('magic');
