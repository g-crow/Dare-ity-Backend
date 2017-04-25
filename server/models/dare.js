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
 const queryString = 'SELECT * from dare'
 db.query(queryString, function(err, result) {
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
 columns = columns.replace(/, $/, '')
 const queryString = `UPDATE dare SET ${columns} WHERE id = ${id}`
 db.query(queryString, function(err, result) {
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
				mobile_video,
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
  const queryString = 'SELECT id, broadcaster_id, dare_id, pledge_amount_threshold, npo_id, pledge_status FROM user_dare WHERE id = $1 OR broadcaster_id = $1 OR dare_id = $1 OR npo_id = $1'
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
//
// Dare.fetchAllUserDares = function(query, callback) {
// console.log(query, '!!!!!!!!!!!!!!!!!!!!!!!!!!');
//  const queryString = `SELECT * from user_dare WHERE broadcaster_id = ${query.broadcaster_id}`
//  db.query(queryString, function(err, result) {
// 	 console.log(result);
//    const match = _.get(result, 'rows')
//    if (err) {
//      callback(err.message)
//    } else if (match) {
//      callback(null, match)
//    } else {
//      callback('No dares found.')
//    }
//  })
// }

Dare.updateUserDare = function(query, callback) {
  let columns = ''
  if (query.broadcaster_id) columns += `broadcaster_id = ${query.broadcaster_id}, `
  if (query.dare_id) columns += `dare_id = ${query.dare_id}, `
  if (query.npo_id) columns += `npo_id = ${query.npo_id}, `
  if (query.pledge_amount_threshold) columns += `pledge_amount_threshold = ${query.pledge_amount_threshold}, `
  if (query.pledge_status) columns += `pledge_status = ${query.pledge_status}, `
	if (query.video_path) columns += `video_path = '${query.video_path}', `
	if (query.mobile_video) columns += `mobile_video = '${query.mobile_video}', `
  columns = columns.replace(/, $/, '')
  const queryString = `UPDATE user_dare SET ${columns} WHERE id = ${query.id}`
  db.query(queryString, function(err, result) {
    if (err) {
     console.log('ERRORRRRRR', err)
     callback('Sorry, please try again')
   } else {
     callback(null, 'Dare info updated.')
   }
  })
}

module.exports = Dare;
