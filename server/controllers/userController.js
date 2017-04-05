var User = require('./server/models/user');
var config = require('./config');
var jwt = require('jsonwebtoken');

app.set('superSecret', config.secret);

//API Routes
var apiRoutes = express.Router();

exports.createuser = function(req, res){
  const {
    username,
    user_id,
    hashed_password,
    is_npo
  } = req.body;

  if(username === undefined || user_id === undefined || hashed_password === undefined || is_npo === undefined){
    res.json(JSON.stringify("Please fill empty fields"));
  }
  var queryString = "INSERT INTO dareity_user (name, user_id, hashed_password, is_npo) "
    + "VALUES ('" + username + "', " + user_id + ", '" + hashed_password + "', " + is_npo + ")"
    console.log(queryString);
	pool.query(queryString, function(err, result){
    if(err){
			console.error("error",err.message);
		} else {
			res.json(JSON.stringify(result))
		}
  })
})

exports.authenticate = function(req, res) {
  User.findOne({
    name: req.body.username
  }, function(err, username) {
    if (err) throw err;

    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });
    } else if (user) {
      if (user.password != req.body.password) {
        res.json({ success: false, message: 'Authentication failed. Wrong password.' });
      } else {
        var token = jwt.sign(user, app.get('superSecret'), {
          expiresIn: 1440 // expires in 24 hours
        });
        res.json({
          success: true,
          message: 'Please have a token!',
          token: token
        });
      }
    }
  });
});

apiRoutes.use(function(req, res, next) {
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  if (token) {

    jwt.verify(token, app.get('superSecret'), function(err, decoded) {
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });
      } else {
        req.decoded = decoded;
        next();
      }
    });

  } else {
    return res.status(403).send({
        success: false,
        message: 'No token provided.'
    });
  }
});

app.use('/api', apiRoutes);
