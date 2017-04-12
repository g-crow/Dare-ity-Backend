const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const config = require('./config');
const jwt = require('jsonwebtoken');
const User = require('./server/models/user');
const usercontroller = require('./server/controllers/userController');
const db = require('./db')


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(morgan('dev'));


//this initializes a connection db
//it will keep idle connections open for 30 seconds
//and set a limit of maximum 10 idle clients

db.connect(function(err, result){
  if(err) {
    throw err
  }
  console.log('Connected to DB')
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
  const name = req.body.name;
  db.query("SELECT id, name, is_npo FROM user WHERE name = '" + name + "'", function(err, result){

    if(err){
      console.error("error", err.message);
    } else {
      res.json(result)
    }
  })
})

apiRoutes.post('/update_user', function(req, res) {
  let columns = ''
  let sqlVars = 1;
  const sqlArgs = []
  if (req.body.is_npo) {
    sqlArgs.push(req.body.is_npo)
    columns += 'is_npo = $' + sqlVars + ', '
    sqlVars += 1
  }
  if (req.body.email) {
    sqlArgs.push(req.body.email)
    columns += `email = '$${sqlVars++}', `
  }
  columns = columns.replace(/, $/, '')
  const queryString = `UPDATE dareity_user SET ${columns} WHERE id = $${sqlVars}`
  db.query(queryString, sqlArgs.concat(req.body.id), function(err, result) {
    if (err) {
      console.error('error', err.message)
      res.json(err.message)
    } else {
      res.json(result)
    }
  })
})

// dare routes
apiRoutes.post('/create_dare', User.requireLogin, function(req, res) {
  const userId =  req.decoded.id
  const {dare_title, dare_description} = req.body
  if (dare_title === undefined || dare_description === undefined) {
    res.json('Please set all required parameters.')
    res.end()
  }
  const queryString = `INSERT INTO dare (title, description, npo_creator, expiration) 
  VALUES ($1, $2, $3, CURRENT_DATE + INTERVAL '30 days') RETURNING *`
  db.query(queryString, [dare_title,dare_description, userId], function(err, result) {
    if (err) {
      console.error('error', err.message)
      res.json(err.message)
    } else {
      res.json(result.rows[0])
    }
  })
})


apiRoutes.post('/fetch_dare', function(req, res) {
  const id = req.body.id
  const queryString = `SELECT id, title, description, npo_creator, expiration, 
  total_pledge_amount FROM dare WHERE id = $1`
  db.query(queryString, [id], function(err, result) {
    if (err) {
      console.error('error', err.message)
      res.json(err.message)
    } else {
      res.json(result)
    }
  })
})



apiRoutes.post('/update_dare', function(req, res) {
  let columns = ''
  if (req.body.title) columns += `title = '${req.body.title}', `
  if (req.body.description) columns += `description = '${req.body.description}', `
  if (req.body.npo_creator) columns += `npo_creator = ${req.body.npo_creator}, `
  if (req.body.expiration) columns += `expiration = '${req.body.expiration}', `
  if (req.body.total_pledge_amount) columns += `total_pledge_amount = ${req.body.total_pledge_amount}, `
  if (req.body.pledge_threshold) columns += `pledge_threshold = ${req.body.pledge_threshold}, `
  columns = columns.replace(/, $/, '')
  const queryString = `UPDATE dare SET ${columns} WHERE id = ${req.body.id}`
  db.query(queryString, function(err, result) {
    if (err) {
      console.error('error', err.message)
      res.json(err.message)
    } else {
      res.json(result)
    }
  })
})

// user_dare routes
apiRoutes.post('/create_user_dare', function(req, res) {
  console.log('decoded', req.decoded)
  const {broadcaster_id, dare_id, npo_id} = req.body
  if (broadcaster_id === undefined || dare_id === undefined || npo_id === undefined) {
    res.json('Please set all required parameters.')
    res.end()
  }
  const queryString = `INSERT INTO user_dare (broadcaster_id, dare_id, npo_id, pledge_amount_threshold) VALUES (${broadcaster_id}, ${dare_id}, ${npo_id}, (SELECT pledge_threshold FROM dare WHERE id = ${dare_id}))`
  db.query(queryString, function(err, result) {
    if (err) {
      console.error('error', err.message)
      res.json(err.message)
    } else {
      res.json(result)
    }
  })
})

apiRoutes.post('/fetch_user_dare', function(req, res) {
  const id = req.body.id
  const queryString = `SELECT id, broadcaster_id, dare_id, pledge_amount_threshold, npo_id, pledge_status FROM user_dare WHERE id = ${id}`
  db.query(queryString, function(err, result) {
    if (err) {
      console.error('error', err.message)
      res.json(err.message)
    } else {
      res.json(result)
    }
  })
})

apiRoutes.post('/update_user_dare', function(req, res) {
  let columns = ''
  if (req.body.broadcaster_id) columns += `broadcaster_id = ${req.body.broadcaster_id}, `
  if (req.body.dare_id) columns += `dare_id = ${req.body.dare_id}, `
  if (req.body.npo_id) columns += `npo_id = ${req.body.npo_id}, `
  if (req.body.pledge_amount_threshold) columns += `pledge_amount_threshold = ${req.body.pledge_amount_threshold}, `
  if (req.body.pledge_status) columns += `pledge_status = ${req.body.pledge_status}, `
  columns = columns.replace(/, $/, '')
  const queryString = `UPDATE user_dare SET ${columns} WHERE id = ${req.body.id}`
  db.query(queryString, function(err, result) {
    if (err) {
      console.error('error', err.message)
      res.json(err.message)
    } else {
      res.json(result)
    }
  })
})

// pledge routes
apiRoutes.post('/create_pledge', function(req, res) {
  const {pledger_id, broadcaster_id, dare_id, npo_id, user_dare_id, pledge_amount, to_refund} = req.body
  if (pledger_id === undefined || broadcaster_id === undefined || dare_id === undefined || npo_id === undefined || user_dare_id === undefined || pledge_amount === undefined || to_refund === undefined) {
    res.json('Please set all required parameters.')
    res.end()
  }
  const queryString = `INSERT INTO pledge (pledger_id, broadcaster_id, dare_id, npo_id, user_dare_id, pledge_amount, to_refund) VALUES (${pledger_id}, ${broadcaster_id}, ${dare_id}, ${npo_id}, ${user_dare_id}, ${pledge_amount}, ${to_refund})`
  db.query(queryString, function(err, result) {
    if (err) {
      console.error('error', err.message)
      res.json(err.message)
    } else {
      res.json(result)
    }
  })
})

apiRoutes.post('/fetch_pledge', function(req, res) {
  const id = req.body.id
  const queryString = `SELECT id, pledger_id, broadcaster_id, dare_id, npo_id, user_dare_id, pledge_amount, to_refund FROM pledge WHERE id = ${id}`
  db.query(queryString, function(err, result) {
    if (err) {
      console.error('error', err.message)
      res.json(err.message)
    } else {
      res.json(result)
    }
  })
})

apiRoutes.post('/update_pledge', function(req, res) {
  let columns = ''
  if (req.body.pledger_id) columns += `pledger_id = ${req.body.pledger_id}, `
  if (req.body.broadcaster_id) columns += `broadcaster_id = ${req.body.broadcaster_id}, `
  if (req.body.dare_id) columns += `dare_id = ${req.body.dare_id}, `
  if (req.body.npo_id) columns += `npo_id = ${req.body.npo_id}, `
  if (req.body.user_dare_id) columns += `user_dare_id = ${req.body.user_dare_id}, `
  if (req.body.pledge_amount) columns += `pledge_amount = ${req.body.pledge_amount}, `
  if (req.body.to_refund) columns += `to_refund = ${req.body.to_refund}, `
  columns = columns.replace(/, $/, '')
  const queryString = `UPDATE pledge SET ${columns} WHERE id = ${req.body.id}`
  db.query(queryString, function(err, result) {
    if (err) {
      console.error('error', err.message)
      res.json(err.message)
    } else {
      res.json(result)
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

app.post('/api/fetch_user_dare', function(req, res){
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
app.post('/api/delete_record', User.requireLogin, function(req, res){
  const {table_name, id} = req.body;
  var queryString = `DELETE FROM ${table_name} WHERE id = ${id} RETURNING *`
  db.query(queryString, function(err, result){
    if(err){
      console.error("error", err.message)
    } else {
      res.json(result.rows[0])
    }
  })
})

var server = app.listen(process.env.PORT || 3001);
module.exports = server;
console.log('magic');




