const User = require('../models/user');
const config = require('./config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')

app.set('superSecret', config.secret);

//API Routes
var apiRoutes = express.Router();

exports.createuser = function(req, res){
  const {
    username,
    password,
    is_npo
  } = req.body;
  var user = new User(username, password, is_npo)
  user.save((err, user)=> err ? res.status(500).json(err) : res.json(user))
})

exports.authenticate = function(req, res) {
  User.findOne({
    name: req.body.username
  }, 
  function(err, username) {
    if (err) throw err;
    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });
    } else {
      bcrypt.compare(this.password, user.hashed_password, function(err, passwordValid){
        if (passwordValid == false) {
          res.json({ success: false, message: 'Authentication failed. Wrong password.' });
        } else {
          var token = jwt.sign(user, app.get('superSecret'), {
            expiresIn: 1440 // expires in 24 hours
          });
          res.json({
            success: true,
            message: 'Please have a token!',
            token: token
          });
        }
      }
    });
  });
}

apiRoutes.use(function(req, res, next) {
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  if (token) {

    jwt.verify(token, app.get('superSecret'), function(err, decoded) {
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });
      } else {
        req.decoded = decoded;
        next();
      }
    });

  } else {
    return res.status(403).send({
        success: false,
        message: 'No token provided.'
    });
  }
});

app.use('/api', apiRoutes);
