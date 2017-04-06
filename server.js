const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const config = require('./config');
const jwt = require('jsonwebtoken');
const User = require('./server/models/user');
const usercontroller = require('./server/controllers/userController');
const db = require('./db')
const { requireLogin } = require('./server/models/user')

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

