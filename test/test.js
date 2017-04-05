
var server = require('../server')
var chai = require('chai')
var chaiHttp = require('chai-http');

chai.use(chaiHttp);

var should = chai.should();



  describe('GET /api/test', function() {
    it('should return string for test', function() {
      chai.request(server) 
      	.get('/api/test')
      	.end(function(err,res){
      		res.body.should.equal('this test works');
      		done();
      	})
      	
    });
  });

