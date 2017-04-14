var server = require('../server')
var chai = require('chai')
var chaiHttp = require('chai-http');
var pg = require('pg');
const user = require('../server/models/user');
const userController = require('../server/controllers/userController')
chai.use(chaiHttp);

var should = chai.should();
var uniqueName = 'smeary' + Date.now()
var uniqueDare = 'plunge' + Date.now()

const getTokenForTest = function(server, callback){
  chai.request(server)
      .post('/api/authenticate')
	  .send({'name': uniqueName, 'password': "abc"})
      .end((err, res) => {
      	callback(null, res.res.body.token)
  	})
}
const createUserForDelete = function(server, callback){
  chai.request(server)
      .post('/api/create_user')
	    .send({'name': uniqueName+Math.floor(Math.random() * 1000), 'password': 'abc', 'email': "bob.abc@gmail.com", 'is_npo': true})
      .end((err, res) => {
				if(err){
					callback(err)
				} else {
     			callback(null, res.res.body.id)
				}
  	})
}
const createDareForDelete = function(server, userId, token, callback){
  chai.request(server)
      .post('/api/create_dare')
	    .send({'npo_creator': userId, 'dare_title': uniqueDare+'1', 'token': token, 'dare_description': "interpret as you'd like"})
			.end((err, res) => {
     		callback(null, res.res.body.id)
  	})
}




describe('POST /api/create_user', function() {
	it('should return NPO user object', function(done){
		chai.request(server)
		.post('/api/create_user')
     	.send({'name': uniqueName, 'password': 'abc', 'email': "bob.abc@gmail.com", 'is_npo': true})
     	.end(function(err,res){
         res.body.should.be.a('object');
         res.body.should.have.property('name');
         res.body.should.have.property('password');
         res.body.should.have.property('email');
         res.body.should.have.property('is_npo');
         res.body.name.should.equal(uniqueName);
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
		.send({'name': uniqueName, 'password': 'abc'})
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


describe('POST /api/create_dare', function() {
	it('should return dare object', function(done) {
		createUserForDelete(server,(err, userId)=> {
			getTokenForTest(server, (err, token)=> {
					chai.request(server)
					.post('/api/create_dare')
					.send({'npo_creator': userId, 'dare_title': uniqueDare, 'token': token, 'dare_description': "interpret as you'd like"})
					.end(function(err,res){
						res.body.should.be.a('object');
						res.body.should.have.property('title');
						res.body.should.have.property('description');
						res.body.title.should.equal(uniqueDare)
						res.body.description.should.equal("interpret as you'd like");
						done();
					})
			})
		})
	})
});

describe('POST /api/fetch_user', function(){
	it('should get a user object', function(done){
		chai.request(server)
		.post('/api/fetch_user')
		.send({'query': uniqueName})
		.end(function(err, res){
			res.body.should.be.a('object');
			res.body.should.have.a.property('success');
			res.body.should.have.a.property('result');
			res.body.result.should.be.a('object')
			res.body.result.should.have.a.property('name');
			res.body.result.should.have.a.property('email');
			done();
		})
	})
})

describe('POST /api/update_user', function() {
	it('should update a users information', function(done) {
		createUserForDelete(server,(err, userId)=> {
			getTokenForTest(server, (err, token)=> {
					chai.request(server)
					.post('/api/update_user')
					.send({'id': userId, 'email': 'bob.abc@gmail.com' })
					.end(function(err,res){
						res.body.should.be.a('object');
						res.body.should.have.property('success');
						res.body.should.have.property('result');
						done();
					})
			})
		})
	})
	it('should update a users information', function(done) {
		createUserForDelete(server,(err, userId)=> {
			getTokenForTest(server, (err, token)=> {
					chai.request(server)
					.post('/api/update_user')
					.send({'id': userId, 'is_npo': true })
					.end(function(err,res){
						res.body.should.be.a('object');
						res.body.should.have.property('success');
						res.body.should.have.property('result');
						done();
					})
			})
		})
	})
});

describe('POST /api/delete_record', function() {
	it('should delete a record from the dareity_user table', function(done) {
		createUserForDelete(server, (err, userId)=> {
			getTokenForTest(server, (err, token)=>{
				chai.request(server)
				.post('/api/delete_record')
				.send({'table_name': 'dareity_user', 'id': userId , 'token': token})
				.end(function(err,res){
					res.body.should.be.a('object')
					res.body.should.have.property('id')
					res.body.should.have.property('name')
					res.body.should.have.property('password')
					res.body.should.have.property('is_npo')
					res.body.should.have.property('email')
					done();
				})
			});
		})
	})

	it('should delete a record from the dare table ', function(done) {
		createUserForDelete(server, (err, userId)=> {
			getTokenForTest(server, (err, token)=>{
				createDareForDelete(server, userId, token, (err, dareId)=>{
					chai.request(server)
					.post('/api/delete_record')
					.send({'table_name': 'dare', 'id': dareId , 'token': token})
					.end(function(err,res){
						res.body.should.be.a('object')
						res.body.should.have.property('id')
						res.body.should.have.property('title')
						res.body.should.have.property('description')
						res.body.should.have.property('npo_creator')
						res.body.should.have.property('expiration')
						res.body.should.have.property('total_pledge_amount')
						res.body.should.have.property('pledge_threshold')
						done();
					})
				})
			});
		})
	})
});
