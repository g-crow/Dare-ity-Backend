const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const config = require('./config');
const jwt = require('jsonwebtoken');
const User = require('./server/models/user');
const Dare = require('./server/models/dare');
const Pledge = require('./server/models/pledge');
const usercontroller = require('./server/controllers/userController');
const db = require('./db')
const darecontroller = require('./server/controllers/dareController');
const pledgecontroller = require('./server/controllers/pledgeController');
const { requireLogin } = require('./server/models/user');


//This is for stripe
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", '*');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE")
  next();
});

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


//API ROUTES
var apiRoutes = express.Router();

app.get('/', function(req, res) {
  res.json({ message: 'Dare-ity api launched!' });
});

app.use('/api', apiRoutes);

//USER ROUTES
apiRoutes.post('/create_user', usercontroller.createuser);
apiRoutes.post('/authenticate', usercontroller.authenticate);
apiRoutes.post('/fetch_user', usercontroller.fetchUser); 
apiRoutes.post('/update_user', usercontroller.updateUser);

//DARE ROUTES
apiRoutes.post('/create_dare', darecontroller.createDare);
apiRoutes.post('/fetch_dare', darecontroller.fetchDare);
apiRoutes.post('/update_dare', darecontroller.updateDare);

//USER_DARE ROUTES
apiRoutes.post('/set_user_dare', darecontroller.setDare);
apiRoutes.post('/fetch_user_dare', darecontroller.fetchUserDare);
apiRoutes.post('/update_user_dare', darecontroller.updateUserDare);

//PLEDGE ROUTES
app.post("/save-stripe-token", pledgecontroller.createStripePledge);
apiRoutes.post('/create_pledge', pledgecontroller.createPledge);
apiRoutes.post('/fetch_pledge', pledgecontroller.fetchPledge);

// apiRoutes.post('/update_pledge', function(req, res) {
//   let columns = ''
//   if (req.body.pledger_id) columns += `pledger_id = ${req.body.pledger_id}, `
//   if (req.body.broadcaster_id) columns += `broadcaster_id = ${req.body.broadcaster_id}, `
//   if (req.body.dare_id) columns += `dare_id = ${req.body.dare_id}, `
//   if (req.body.npo_id) columns += `npo_id = ${req.body.npo_id}, `
//   if (req.body.user_dare_id) columns += `user_dare_id = ${req.body.user_dare_id}, `
//   if (req.body.pledge_amount) columns += `pledge_amount = ${req.body.pledge_amount}, `
//   if (req.body.to_refund) columns += `to_refund = ${req.body.to_refund}, `
//   columns = columns.replace(/, $/, '')
//   const queryString = `UPDATE pledge SET ${columns} WHERE id = ${req.body.id}`
//   db.query(queryString, function(err, result) {
//     if (err) {
//       console.error('error', err.message)
//       res.json(err.message)
//     } else {
//       res.json(result)
//     }
//   })
// })



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

