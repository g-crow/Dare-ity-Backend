var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var config = require('./config');
var jwt = require('jsonwebtoken');
var User = require('./server/models/user');
var usercontroller = require('./server/controllers/userController');
var Pool = require('pg').Pool;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(morgan('dev'));

//API Routes
var apiRoutes = express.Router();

process.on('unhandledRejection', function(e) {
  console.log(e.message, e.stack)
})

// //GET
// app.get('*', function(req, res){
// 	pool.query('SELECT * FROM dareity_user', function(err, result){
//     if(err){
// 			console.error("error",err.message);
// 		} else {
// 			res.json(JSON.stringify(result))
// 		}
//   })
// });

app.get('/', function(req, res) {
  res.json({ message: 'Dare-ity api launched!' });
});

app.use('/api', apiRoutes);

//POST
apiRoutes.post('/create_user', usercontroller.createuser);
apiRoutes.post('/authenticate', usercontroller.authenticate);

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
console.log('magic');
