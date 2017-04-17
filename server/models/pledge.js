const db = require('../../db');

class Pledge {
  constructor(pledger_id, broadcaster_id, dare_id, npo_id, user_dare_id, pledge_amount, to_refund){
    this.pledger_id = pledger_id; //pledger_id is the same as user_id; will be grabbed from the state
    this.broadcaster_id = broadcaster_id;
    this.dare_id = dare_id;
    this.npo_id = npo_id;
    this.user_dare_id = user_dare_id;
    this.pledge_amount = pledge_amount;
    this.to_refund = to_refund;
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

Pledge.updatePledge = function(query, callback) {
  let columns = ''
  if (query.pledger_id) columns += `pledger_id = ${query.pledger_id}, `
  if (query.broadcaster_id) columns += `broadcaster_id = ${query.broadcaster_id}, `
  if (query.dare_id) columns += `dare_id = ${query.dare_id}, `
  if (query.npo_id) columns += `npo_id = ${query.npo_id}, `
  if (query.user_dare_id) columns += `user_dare_id = ${query.user_dare_id}, `
  if (query.pledge_amount) columns += `pledge_amount = ${query.pledge_amount}, `
  if (query.to_refund) columns += `to_refund = ${query.to_refund}, `
  columns = columns.replace(/, $/, '')
  const queryString = `UPDATE pledge SET ${columns} WHERE id = ${query.id}`
  db.query(queryString, function(err, result) {
    if (err) {
      callback('Sorry, please try again')
    } else {
      callback(null, 'Pledge info updated')
    }
  })
}

module.exports = Pledge;
