var Susi = require('./susi');

var susi = new Susi();

// register preprocessor for all events
susi.registerProcessor('.*', function(evt) {
    evt.payload = evt.payload || {};
    evt.ack();
});

// add 'foo' processor
var processorId = susi.registerProcessor('foo', function(evt) {
    evt.payload.foo = 'bar';
    evt.ack();
});

// add 'foo' consumer
var consumerId = susi.registerConsumer('foo', function(evt) {
    console.log('consumer', JSON.stringify(evt.payload));
});

/**
 * Example  for publishing with promise
 * @param {json} processor/cusomer information
 */
susi.publish({topic : 'foo'})
    .then(function(evt){
        console.log('finish', JSON.stringify(evt.payload));
        console.log('-----------------------------------');
        susi.unregisterProcessor(processorId);
    })
    .catch(function (evt , err) {
        console.log('err');
        console.error(err);
    });

susi.publish({topic : 'foo'}).then(function(evt){
    console.log('finish', JSON.stringify(evt.payload));
    console.log('-----------------------------------');
    susi.unregisterConsumer(consumerId);
});

susi.publish({topic : 'foo'}).then(function(evt){
    console.log('---------------Done----------------');
     susi.unregisterConsumer(consumerId);
});
