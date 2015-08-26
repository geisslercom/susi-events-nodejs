var Susi = require("../susi");
var chai = require("chai");
var assert = chai.assert;
var expect = chai.expect;
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised)

describe('SusiBasicTests', function () {
	var susi;

	describe('new Susi', function () {
		it('should instanciate a susi class', function () {
			susi = new Susi();
			assert.equal(susi instanceof(Susi), true);
		});		
	});
	describe('Susi Instance Checks', function () {
		it('should register a preprocessor', function (done) {
			susi.registerProcessor('.*', function(evt){
   				evt.payload = evt.payload || {};
    			evt.ack();
			});
			done()
		});
		it('should have a topic, callback and id', function (done) {
			expect(susi.processors[0]).to.property("id").and.be.a('string')
			expect(susi.processors[0]).to.have.property("callback").and.be.a('function')
			expect(susi.processors[0]).to.property("topic", ".*").and.be.a('string')
    		done();
		});
		it('should register a processor', function (done) {
			var processorId = susi.registerProcessor('foo',function (evt){
			    evt.payload.foo = 'bar';
			    evt.ack();
			});
			expect(processorId).to.be.a('string').and.have.length(32)
			done();
		});

		it('should register a consumer', function (done) {
			var consumerId = susi.registerConsumer('foo',function(evt){
				evt.payload.foo = "bar"
			});
			expect(consumerId).to.be.a('string').and.have.length(32)
			done();
		});

		it('should publish foo and unregister the processor', function (done) {
			susi.publish({topic: 'foo'}).then(function(evt){
	    		expect(evt.payload).to.have.property("foo","bar")
    			susi.unregisterProcessor(processorId);
	    		done()
			})
		});
	});
});
