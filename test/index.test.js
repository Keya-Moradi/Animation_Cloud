var expect = require('chai').expect;
var request = require('supertest');
var app = require('../server'); 
// make sure that we export the app


describe('App', function() {
  it('should return a 200 response', function(done) {
    request(app).get('/').expect(200, done);
  });
});


