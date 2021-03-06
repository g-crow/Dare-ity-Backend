const db = require('../../db');
const _ = require('lodash');

class Dare{
	constructor(title, description, npo_creator, expiration, pledge_threshold, image_path){
		this.title = title;
		this.description = description;
		this.npo_creator = npo_creator;
		this.expiration = expiration;
		this.pledge_threshold = pledge_threshold;
		this.image_path = image_path;
	}

	save(callback){
		if (!this.title || !this.description) {
			callback(new Error('Please make sure both title and description are entered.'))
		} else {
			const queryString = `INSERT INTO dare (title, description, npo_creator, expiration, pledge_threshold, image_path) VALUES ('${this.title}', '${this.description}', ${this.npo_creator}, '${this.expiration}', ${this.pledge_threshold}, '${this.image_path}')`
			db.query(queryString, function(err, result) {
			    if (err) {
						console.log(err)
			      callback('Sorry, please try again')
			    } else {
			      callback(null, result)
			    }
			  });
		}
	}
}


Dare.fetchDare = function(query, callback) {
 const queryString = 'SELECT title, description FROM dare WHERE title=$1 OR description=$1'
 db.query(queryString, [query], function(err, result) {
   const match = _.get(result, 'rows[0]')
   if (err) {
     callback(err.message)
   } else if (match) {
     callback(null, match)
   } else {
     callback('No dare found.')
   }
 })
}

Dare.fetchAllDares = function(query, callback) {
 db.query(`SELECT 							dare.id AS dare_id,
															dare.title,
															dare.description,
															dare.npo_creator,
															dare.expiration,
															dare.pledge_threshold,
															dare.image_path,
															dareity_user.id AS npo_id,
															dareity_user.name AS npo_name


FROM dare JOIN dareity_user ON npo_creator = dareity_user.id`,
function(err, result) {
   const dares = result.rows
   if (err) {
     callback(err.message)
   } else if (result) {
     callback(null, dares)
   } else {
     callback('No dare found.')
   }
 })
}


Dare.updateDare = function(query, id, callback) {
 let columns = ''
 if (query.title) columns += `title = '${query.title}', `
 if (query.description) columns += `description = '${query.description}', `
 if (query.npo_creator) columns += `npo_creator = ${query.npo_creator}, `
 if (query.expiration) columns += `expiration = '${query.expiration}', `
 if (query.pledge_threshold) columns += `pledge_threshold = ${query.pledge_threshold}, `
 if (query.image_path) columns += `image_path = ${query.image_path}, `
 columns = columns.replace(/, $/, '')
 const queryString = `UPDATE dare SET ${columns} WHERE id = $1`
 db.query(queryString, [id], function(err, result) {
   if (err) {
     callback('Sorry, please try again')
   } else {
     callback(null, 'Dare info updated.')
   }
 })
}

Dare.setDare = function(query, callback) {
  const {
  			broadcaster_id,
  			dare_id,
  			npo_id,
  			pledge_amount_threshold,
				video_path,
  		} = query;
  if (broadcaster_id === undefined || dare_id === undefined || npo_id === undefined || pledge_amount_threshold === undefined) {
    callback('Please set all required parameters.')
  }
  const queryString = `INSERT INTO user_dare (broadcaster_id, dare_id, npo_id, pledge_amount_threshold) VALUES (${broadcaster_id}, ${dare_id}, ${npo_id}, ${pledge_amount_threshold})`
  db.query(queryString, function(err, result) {
    if (err) {
      callback(err.message)
    } else {
      callback(null, result)
    }
  })
}

Dare.fetchUserDare = function(query, callback) {
  const queryString = `SELECT user_dare.id, user_dare.broadcaster_id, user_dare.dare_id, user_dare.pledge_amount_threshold, user_dare.npo_id, dare.title, dare.description, total_pledges
                        FROM user_dare 
                          JOIN dare ON user_dare.dare_id=dare.id
                          LEFT JOIN (SELECT user_dare_id, sum(pledge_amount) as total_pledges FROM pledge GROUP BY user_dare_id) AS pledge_totals ON user_dare.id = pledge_totals.user_dare_id
                        WHERE user_dare.id = $1 OR user_dare.broadcaster_id = $1 OR user_dare.dare_id = $1 OR user_dare.npo_id = $1`
  db.query(queryString, [query], function(err, result) {
     const match = _.get(result, 'rows[0]')
    if (err) {
      callback(err.message)
    } else if (match) {
      callback(null, match)
    } else {
     callback('No dare found.')
 	}
  })
}

Dare.fetchAllUserDares = function(query, callback) {
console.log(query, '!!!!!!!!!!!!!!!!!!!!!!!!!!');
 const queryString = `SELECT * FROM user_dare JOIN dare ON user_dare.dare_id = dare.id JOIN dareity_user ON user_dare.broadcaster_id=dareity_user.id`
 db.query(queryString, function(err, result) {
	 console.log(result);
   const match = _.get(result, 'rows')
   if (err) {
     callback(err.message)
   } else if (match) {
     callback(null, match)
   } else {
     callback('No dares found.')
   }
 })
}

Dare.updateUserDare = function(query, callback) {
  let columns = ''
  if (query.broadcaster_id) columns += `broadcaster_id = ${query.broadcaster_id}, `
  if (query.dare_id) columns += `dare_id = ${query.dare_id}, `
  if (query.npo_id) columns += `npo_id = ${query.npo_id}, `
  if (query.pledge_amount_threshold) columns += `pledge_amount_threshold = ${query.pledge_amount_threshold}, `
	if (query.video_path) columns += `video_path = '${query.video_path}', `
  columns = columns.replace(/, $/, '')
  const queryString = `UPDATE user_dare SET ${columns} WHERE id = $1`
  db.query(queryString, [query.id], function(err, result) {
    if (err) {
     console.log('ERRORRRRRR', err)
     callback('Sorry, please try again')
   } else {
     callback(null, 'Dare info updated.')
   }
  })
}

module.exports = Dare;
