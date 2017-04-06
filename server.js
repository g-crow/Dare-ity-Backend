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

  app.post('/api/create_user', function(req, res){
    const {username, hashed_password, is_npo} = req.body;
    if(username === undefined || hashed_password === undefined || is_npo === undefined){
      res.json(JSON.stringify("Please fill empty fields."));
    }
    var queryString = "INSERT INTO client (name, hash_password, is_npo) "
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
    pool.query("SELECT id, name, is_npo FROM client WHERE name = '" + username + "'", function(err, result){
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

  app.post('/api/fetch_dare', function(req, res){
    var id = req.body.id;
    pool.query("SELECT id_dare, dare_title, dare_description, npo_creator, dare_expires, total_pledge_dollar_amount FROM dare WHERE id_dare = " + id, function(err, result){
      if(err){
        console.error("error", err.message);
      } else {
        res.json(JSON.stringify(result.rows[0]))
      }
    })
  })

  app.listen(process.env.PORT || 3001);
  console.log('magic');
}

