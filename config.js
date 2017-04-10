module.exports = {
  'secret': 'cohort5rocksmysocks',
  'saltRounds': 10,
   db: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'dare',
    password: process.env.DB_PASS || 'dare',
    database: process.env.DB_NAME || 'dareity'
  }
};
