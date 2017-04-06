const User = require('../models/user');

const createuser = function(req, res){
  const {
    name,
    password,
    email,
    is_npo
  } = req.body;
  var user = new User(name, password, email, is_npo)
  user.save((err, user)=> err ? res.status(500).json(err) : res.json(user))
}

const authenticate = function(req, res) {
  const { name, password } = req.body;
  User.authenticate(name, password, (err, token) => {
    if (err){
      res.status(400).json({success: false, message: err})
    } else {
      res.json({
                success: true,
                message: 'Please have a token!',
                token: token
              });
    }
  })
}

module.exports = { createuser, authenticate}
