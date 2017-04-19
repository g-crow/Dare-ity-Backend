const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const config = require('./config');
const jwt = require('jsonwebtoken');
const User = require('./server/models/user');
const Dare = require('./server/models/dare');
const Pledge = require('./server/models/pledge');
const userController = require('./server/controllers/userController');
const db = require('./db')
const dareController = require('./server/controllers/dareController');
const pledgeController = require('./server/controllers/pledgeController');
const { requireLogin } = require('./server/models/user');
const aws = require('aws-sdk');


//This is for image upload
app.set('views', './views');
app.engine('html', require('ejs').renderFile);

const S3_BUCKET = process.env.S3_BUCKET;

app.get('/account', (req, res) => res.render('account.html'));

app.get('/sign-s3', (req, res) => {
  const s3 = new aws.S3();
  const fileName = req.query['file-name'];
  const fileType = req.query['file-type'];
  const s3Params = {
    Bucket: S3_BUCKET,
    Key: fileName,
    Expires: 60,
    ContentType: fileType,
    ACL: 'public-read'
  };

  s3.getSignedUrl('putObject', s3Params, (err, data) => {
    if(err){
      console.log(err);
      return res.end();
    }
    const returnData = {
      signedRequest: data,
      url: `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}`
    };
    res.write(JSON.stringify(returnData));
    res.end();
  });
});


//This is for stripe
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", '*');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE")
  next();
});


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan('dev'));

//this initializes a connection db
//it will keep idle connections open for 30 seconds
//and set a limit of maximum 10 idle clients

db.connect(function(err, result){
  if(err) {
    throw err
  }
  console.log('Connected to DB')
})

//API ROUTES
var apiRoutes = express.Router();

app.get('/', function(req, res) {
  res.json({ message: 'Dare-ity api launched!' });
});

app.use('/api', apiRoutes);

//USER ROUTES
apiRoutes.post('/create_user', userController.createuser);
apiRoutes.post('/authenticate', userController.authenticate);
apiRoutes.post('/fetch_user', userController.fetchUser);
apiRoutes.post('/update_user', requireLogin, userController.updateUser);

//DARE ROUTES
apiRoutes.post('/create_dare', requireLogin, dareController.createDare);
apiRoutes.post('/fetch_dare', dareController.fetchDare);
apiRoutes.post('/update_dare', requireLogin, dareController.updateDare);

//USER_DARE ROUTES
apiRoutes.post('/set_user_dare', requireLogin, dareController.setDare);
apiRoutes.post('/fetch_user_dare', dareController.fetchUserDare);
apiRoutes.post('/update_user_dare', requireLogin, dareController.updateUserDare);

//PLEDGE ROUTES
app.post("/save-stripe-token", pledgeController.createStripePledge);
apiRoutes.post('/create_pledge', requireLogin, pledgeController.createPledge);
apiRoutes.post('/fetch_pledge', pledgeController.fetchPledge);
apiRoutes.post('/update_pledge', requireLogin, pledgeController.updatePledge);

//DELETE ROUTES (one delete route for all DB records - table name, id column name, and record id must be provided)
app.post('/api/delete_record', requireLogin, userController.deleteRecord);

var server = app.listen(process.env.PORT || 3001);
module.exports = server;
console.log('magic');
