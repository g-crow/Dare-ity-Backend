const bcrypt = require('bcrypt');
const config = require('../../config');
const db = require('../../db');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

class User{
	constructor(name, password, email, bio, is_npo, profilepic_path){
		this.name = name;
		this.password = password;
		this.email = email;
    this.bio = bio;
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
					const queryString = `INSERT INTO dareity_user (name, password, email, bio, is_npo, profilepic_path)
          VALUES ('${this.name}', '${hashed_password}', '${this.email}', '${this.bio}', ${this.is_npo}, '${this.profilepic_path}') RETURNING *`
					db.query(queryString, callback)
				} else {
					callback(hashErr)
				}
			})
		}
	}
}

User.authenticate = function(name, password, callback){
  db.query(`SELECT name, id, is_npo, password, profilepic_path FROM dareity_user WHERE name = '${name}'`,
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
						const {is_npo, name, id, profilepic_path} = user;
            callback(null, { token, id, is_npo, name, profilepic_path})
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
  db.query(
		`SELECT 						dareity_user.id AS user_id,
						dareity_user.is_npo,
						dareity_user.name,
						dareity_user.email,
						dareity_user.profilepic_path,
						dareity_user.bio,
						dare.id as dare_id,
						dare.title,
						dare.image_path,
						dare.description,
						user_dare.id AS user_dare_id,
						user_dare.video_path,
						user_dare.pledge_amount_threshold,
						npo.name AS npo_name,
						npo.id AS npo_id,
						pledge_totals.total_pledges

			FROM dareity_user
				LEFT JOIN user_dare ON dareity_user.id = user_dare.broadcaster_id
				LEFT JOIN dare ON user_dare.dare_id = dare.id
				LEFT JOIN dareity_user AS npo ON dare.npo_creator = npo.id
				LEFT JOIN (SELECT user_dare_id, sum(pledge_amount) as total_pledges FROM pledge GROUP BY user_dare_id) AS pledge_totals ON user_dare.id = pledge_totals.user_dare_id
			`,
		function(err, result){
		    const rows = (result.rows)
				console.log('rows', rows)
				const users = {}
		    if (err){
		      callback(err.message)
		    } else if (result){
					const dares =  rows.filter((row) => row.dare_id)
														  .map((row) => ({
																userId: row.user_id,
																user: row.name,
																npo_id: row.npo_id,
																video_path: row.video_path,
																dare_id: row.dare_id,
																title: row.title,
																pledge_amount_threshold: row.pledge_amount_threshold,
																description: row.description,
																image_path: row.image_path,
																npo_name: row.npo_name,
																user_dare_id: row.user_dare_id,
																total_pledges: row.total_pledges
															}))
					const users = rows.reduce((users, row) => {
						users[row.name] = {
							id: row.user_id,
							name: row.name,
							is_npo: row.is_npo,
							email: row.email,
							profilepic_path: row.profilepic_path,
							bio: row.bio,
							dares: []
						}
						return users
					}, {})
					console.log('users', users)
					dares.forEach(dare => users[dare.user].dares.push(dare))
		      callback(null, _.values(users))
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
