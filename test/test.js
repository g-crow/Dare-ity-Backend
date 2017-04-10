var server = require('../server')
var chai = require('chai')
var chaiHttp = require('chai-http');
var pg = require('pg');
const user = require('../server/models/user');
const userController = require('../server/controllers/userController')
chai.use(chaiHttp);

var should = chai.should();

describe('POST /api/create_user', function() {
	it('should return NPO user object', function(done){
		chai.request(server)
		.post('/api/create_user')
     	.send({'name': 'bob', 'password': 'abc', 'email': "bob.abc@gmail.com", 'is_npo': true})
     	// console.log(use);
     	.end(function(err,res){
     	console.log(res.body)
         res.body.should.be.a('object');
         res.body.should.have.property('name');
         res.body.should.have.property('password');
         res.body.should.have.property('email');
         res.body.should.have.property('is_npo');
         res.body.name.should.equal('bob');
         //res.body.password.should.equal(hashed_password);
         res.body.email.should.equal('bob.abc@gmail.com');
         res.body.is_npo.should.equal(true);
         done();
     	})
    });
});

describe('POST /api/authenticate', function() {
	it('should return token', function(done){
		chai.request(server)
		.post('/api/authenticate')
		.send({'name': 'bob', 'password': 'abc'})
		.end(function(err,res){
			res.body.should.be.a('object');
			res.body.should.have.property('success');
			res.body.should.have.property('message');
			res.body.should.have.property('token');
			res.body.success.should.equal(true);
			res.body.message.should.equal('Please have a token!');
			done();
		})
	});
});

// requireLogin = function(server, callback){
//   chai.request(server)
//       .post('/login/url') 
//       .send({username: "Ron", password: "blueberry"})
//       .end((err, res) => {
//       callback(null, res.body.token)
//   })
// }

describe('POST /api/create_dare', function() {
 it('should return dare object', function(done) {
     requireLogin(server, (err, token) =>{
         chai.request(server) 
         .post('/api/create_dare')
         .send({'title': 'face plunge', token, 'description': "interpret as you'd like"})
         .end(function(err,res){
             console.log('before object test');
             res.body.should.be.a('object');
             console.log('before dare_title prop');
             res.body.should.have.property('title');
             res.body.should.have.property('description');
             res.body.title.should.equal('face plunge');
             res.body.description.should.equal("interpret as you'd like");
             done();
         })
     }); 
 });

//  it('blank fields should return message', function() {
//      chai.request(server) 
//      .post('/api/create_dare')
//      .send({'title': undefined, 'description': undefineds})
//      .end(function(err,res){
//          res.body.should.be.json;
//          res.body.json.should.equal(JSON.stringify("Please fill empty fields"));
//          done();
//      })
//  });
// });