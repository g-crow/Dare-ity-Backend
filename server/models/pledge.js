const db = require('../../db');

class Pledge {
    constructor(pledger_id, broadcaster_id, dare_id, npo_id, user_dare_id, pledge_amount, to_refund){
        this.pledger_id = pledger_id; //pledger_id is the same as user_id; will be grabbed from the state
        this.broadcaster_id = broadcaster_id;
        this.dare_id = dare_id;
        this.npo_id = npo_id;
        this.user_dare_id = user_dare_id;
        this.pledge_amount = pledge_amount;
        this.to_refund = to_refund
    }
    save(callback){
          if (!this.pledger_id || !this.broadcaster_id || !this.dare_id || !this.npo_id || !this.user_dare_id || !this.pledge_amount || !this.to_refund) {
            callback(new Error('Please provide the correct information.'))
          }
          const queryString = `INSERT INTO pledge (pledger_id, broadcaster_id, dare_id, npo_id, user_dare_id, pledge_amount, to_refund) VALUES (${this.pledger_id}, ${this.broadcaster_id}, ${this.dare_id}, ${this.npo_id}, ${this.user_dare_id}, ${this.pledge_amount}, ${this.to_refund})`
          db.query(queryString, function(err, result) {
            if (err) {
              console.error('error', err.message)
              callback(err.message)
            } else {
              callback(null, result)
            }
       	  })
    }
}

Pledge.fetchPledge = function(id, callback) {
  const queryString = `SELECT id, pledger_id, broadcaster_id, dare_id, npo_id, user_dare_id, pledge_amount, to_refund FROM pledge WHERE id = ${id}`
  db.query(queryString, function(err, result) {
    if(err){
      callback(err.message)
    } else if(result.rows[0]){
      callback(null, result.rows[0])
    } else{
      callback('No pledge found.')
    }
  })
}


module.exports = Pledge;

