const pg = require('pg')
const config = require('./config')
//this initializes a connection pool
//it will keep idle connections open for 30 seconds
//and set a limit of maximum 10 idle clients

let client;

pg.defaults.ssl = true;
if(!client){
  pg.connect(process.env.DATABASE_URL || config.db, function(err, _client) {
    if (err) throw err;
    console.log('Connecting to database')
    client = _client
  );
}

module.exports = {
  query : client.query
}