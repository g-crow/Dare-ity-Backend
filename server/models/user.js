const bcrypt = require('bcrypt')
const config = require('../../config')

export default class User(){
	constructor(username, password, is_npo){
		this.username = username;
		this.password = password;
		this.is_npo = is_npo || false
	}

	save(callback){
		if (!username || !password){
			callback(new Error('No Username or password provided'))
		} else {
			const hashed_password = ''
			bcrypt.hash(this.password, config.saltRounds, (hashErr, hashed_password) => {
				if (!hashErr){
					const queryString = `INSERT INTO dareity_user (name, hashed_password, is_npo) VALUES ('${this.username}', '${hashed_password}', ${this.is_npo})`
					pool.query(queryString, callback)
				} else {
					callback(hashErr)
				}
			})
			
				
		}
	}
}
