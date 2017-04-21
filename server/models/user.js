const bcrypt = require('bcrypt');
const config = require('../../config');
const db = require('../../db');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

class User{
	constructor(name, password, email, is_npo, profilepic_path){
		this.name = name;
		this.password = password;
		this.email = email;
		this.is_npo = is_npo;
		this.profilepic_path = profilepic_path;
	}

	save(callback){
		if (!this.name || !this.password || !this.email){
			callback(new Error('Please provide Name, password, and email'))
		} else {
			const hashed_password = ''
			bcrypt.hash(this.password, config.saltRounds, (hashErr, hashed_password) => {
				if (!hashErr){
					const queryString = `INSERT INTO dareity_user (name, password, email, is_npo, profilepic_path)
          VALUES ('${this.name}', '${hashed_password}', '${this.email}', ${this.is_npo}, '${this.profilepic_path}') RETURNING *`
					db.query(queryString, callback)
				} else {
					callback(hashErr)
				}
			})
		}
	}
}

User.authenticate = function(name, password, callback){
  db.query(`SELECT name, id, is_npo, password FROM dareity_user WHERE name = '${name}'`,
  function(err, result) {
    const user = result.rows[0]
    if (err) throw err;
      if (!user) {
        callback('Authentication failed. User not found.')
      } else {
        bcrypt.compare(password, user.password, function(err, passwordValid){
          if (passwordValid == false) {
            callback('Authentication failed. Wrong password.');
          } else {
            var token = jwt.sign(user, config.secret, {
              expiresIn: "1d" // expires in 24 hours
            });
            callback(null, token)
          }
        });
      }
  })
}

User.requireLogin = function(req, res, next) {
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  if (token) {
    jwt.verify(token, config.secret, function(err, decoded) {
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });
      } else {
        decoded.id = req.body.npo_creator;
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
}

User.fetchUser = function(query, callback) {
  db.query('SELECT * FROM dareity_user WHERE name=$1 OR email=$1', [query], function(err, result){
    const user = _.get(result, 'rows[0]')
    if (err){
      callback(err.message)
    } else if (user) {
      callback(null, user)
    } else {
      callback('No user found.')
    }
  })
}

User.fetchAllUsers = function(query, callback) {
  db.query('SELECT * FROM dareity_user', function(err, result){
    const users = (result.rows)
    if (err){
      callback(err.message)
    } else if (result) {
      callback(null, users)
    } else {
      callback('No user found.')
    }
  })
}

User.updateUser = function(query, id, callback) {
  let columns = ''
  if (query.is_npo) columns += `is_npo = ${query.is_npo}, `
  if (query.email) columns += `email = '${query.email}', `
  columns = columns.replace(/, $/, '')
  const queryString = `UPDATE dareity_user SET ${columns} WHERE id = ${id}`
  db.query(queryString, function(err, result) {
    console.log('result', result);
    if (err) {
      callback('Sorry, please try again')
    } else {
      callback(null, 'User info updated')
    }
  })
}

User.deleteRecord = function(query, callback){
  const {table_name, id} = query;
  var queryString = `DELETE FROM ${table_name} WHERE id = ${id} RETURNING *`
  db.query(queryString, function(err, result){
    if(err){
      callback('Sorry, please try again')
    } else {
      callback(null, 'Record deleted')
    }
  })
}

module.exports = User
