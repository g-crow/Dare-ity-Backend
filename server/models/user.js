const bcrypt = require('bcrypt')
const config = require('../../config')
const db = require('../../db')
const jwt = require('jsonwebtoken');


class User{
	constructor(username, password, is_npo){
		this.username = username;
		this.password = password;
		this.is_npo = is_npo || false
	}

	save(callback){
		if (!this.username || !this.password){
			callback(new Error('No Username or password provided'))
		} else {
			const hashed_password = ''
			bcrypt.hash(this.password, config.saltRounds, (hashErr, hashed_password) => {
				if (!hashErr){
					const queryString = `INSERT INTO dareity_user (name, hashed_password, is_npo) VALUES ('${this.username}', '${hashed_password}', ${this.is_npo})`
					db.query(queryString, callback)
				} else {
					callback(hashErr)
				}
			})
			
				
		}
	}
}

User.authenticate = function(username, password, callback){
    db.query(`SELECT name, is_npo, hashed_password FROM dareity_user WHERE name = '${username}'`, 
    function(err, result) {
      const user = result.rows[0]
      if (err) throw err;
        if (!user) {
          callback('Authentication failed. User not found.')
        } else {
          bcrypt.compare(password, user.hashed_password, function(err, passwordValid){
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
    }
  )
}

User.requireLogin = function(req, res, next) {
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  if (token) {

    jwt.verify(token, config.secret, function(err, decoded) {
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
};

module.exports = User
