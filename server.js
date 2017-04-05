var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var config = require('./config');
var jwt = require('jsonwebtoken');
var User = require('./server/models/user');
var usercontroller = require('./server/controllers/userController');
var db = require('./db')

db.connect((err, res)=>{
  if(err) {
    throw new Error(err.message);
  }

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  app.use(morgan('dev'));

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
    var username = req.body.dareity_user;
    db.query("SELECT user_id, name, is_npo FROM dareity_user WHERE name = '" + username + "'", function(err, result){
      if(err){
        console.error("error",err.message);
      } else {
        res.json(result.rows)
      }
    })
  })

  app.listen(process.env.PORT || 3001);
  console.log('magic');
})

