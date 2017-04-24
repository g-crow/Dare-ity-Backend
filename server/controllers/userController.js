const User = require('../models/user');

const createuser = function(req, res){
  const {
          name,
          password,
          email,
          bio,
          is_npo,
          profilepic_path
        } = req.body;
  var user = new User(name, password, email, bio, is_npo, profilepic_path)
  user.save((err, user)=> err ? res.status(500).json(err) : res.json(user.rows[0]))
}

const authenticate = function(req, res) {
  const { name, password } = req.body;
  User.authenticate(name, password, (err, userData) => {
    if (err){
      res.status(400).json({success: false, message: err})
    } else {
      res.json(Object.assign({
                success: true
              }, userData ));
    }
  })
}

const fetchUser = function(req, res) {
  const { query } = req.body;
  User.fetchUser(query, (err, result) => {
    if (err){
      res.status(400).json({success: false, message: err})
    } else {
      res.json({
                success: true,
                result: result
              });
    }
  })
}

const fetchAllUsers = function(req, res) {
  const { query } = req.body;
  User.fetchAllUsers(query, (err, result) => {
    if (err){
      res.status(400).json({success: false, message: err})
    } else {
      res.json({
                success: true,
                result: result
              });
    }
  })
}

const updateUser = function(req, res) {
  const id = req.body.id;
  const query = req.body;
  User.updateUser(query, id, (err, result) => {
    if (err) {
      res.status(400).json({success: false, message: err})
    } else {
      res.json({
                success: true,
                result: result
              });
    }
  })
}

const deleteRecord = function(req, res){
  const query = req.body;
  User.deleteRecord(query, function(err, result){
    if(err){
      res.status(400).json({success: false, message: err})
    } else {
      res.json({
                success: true,
                result: result
              });
    }
  })
}

module.exports = { createuser, authenticate, fetchUser, fetchAllUsers, updateUser, deleteRecord }
