const db = require('../../db');

class Dare{
	constructor(title, description, npo_creator, expiration, pledge_threshold){
		this.title = title;
		this.description = description;
		this.npo_creator = npo_creator;
		this.expiration = expiration;
		this.pledge_threshold = pledge_threshold;
	}

	save(callback){
		if (!this.title || !this.description || !this.expiration || !this.pledge_threshold){
			callback(new Error('Please make sure title, description, expiration, and the pledge threshold are entered.'))
		} else {
			const queryString = `INSERT INTO dare (title, description, npo_creator, expiration, pledge_threshold) VALUES ('${this.title}', '${this.description}', ${this.npo_creator}, '${this.expiration}', ${this.pledge_threshold})`
			db.query(queryString, function(err, result) {
				console.log(err);
			    if (err) {
			      callback('Sorry, please try again')
			    } else {
			      callback(null, 'User info updated')
			    }
			  });
		}
	}
}

Dare.fetchDare = function(query, callback) {
  const queryString = 'SELECT title, description, npo_creator, expiration FROM dare WHERE title=$1 OR description=$1 OR npo_creator=$1 OR expiration=$1'
  db.query(queryString, [query], function(err, result) {
		const dare = result.rows[0]
    if (err) {
      callback(err.message)
    } else if (dare) {
      callback(null, dare)
    } else {
			callback('No dare found.')
		}
  })
}

module.exports = Dare;
