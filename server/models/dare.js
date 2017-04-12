const db = require('../../db');
const _ = require('lodash');

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
			      callback(null, 'Dare created.')
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

module.exports = Dare;
