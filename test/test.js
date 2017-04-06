
var server = require('../server')
var chai = require('chai')
var chaiHttp = require('chai-http');

chai.use(chaiHttp);

var should = chai.should();

const login = function(server, callback){
	chai.request(server)
		.post('/login/url')	
		.send({username: "Ron", password: "blueberry"})
		.end((err, res) => {
		callback(null, res.body.token)
	})
}

describe('POST /api/create_dare', function() {
	it('should return dare object', function(done) {
		login(server, (err, token) =>{
			chai.request(server) 
			.post('/api/create_dare')
			.send({'dare_title': 'face plunge', token, 'dare_description': "interpret as you'd like", 'npo_creator': 'theWatchers.org'})
			.end(function(err,res){
				console.log('before object test');
				res.body.should.be.a('object');
				console.log('before dare_title prop');
				res.body.should.have.property('dare_title');
				res.body.should.have.property('dare_description');
				res.body.should.have.property('npo_creator');
				res.body.dare_title.should.equal('face plunge');
				res.body.dare_description.should.equal("interpret as you'd like");
				res.body.npo_creator.should.equal('theWatchers.org');
				done();
			})
		})
		
	});
	it('blank fields should return message', function() {
		chai.request(server) 
		.post('/api/create_dare')
		.send({'dare_title': undefined, 'dare_description': undefined, 'npo_creator': undefined})
		.end(function(err,res){
			res.body.should.be.json;
			res.body.json.should.equal(JSON.stringify("Please fill empty fields"));
			done();
		})
	});
});


