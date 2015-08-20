var Susi = require('./susi');

var susi = new Susi();

// register preprocessor for all events
susi.registerProcessor('.*', (evt) => {
    evt.payload = evt.payload || {};
    evt.ack();
});

// add 'foo' processor
var processorId = susi.registerProcessor('foo', (evt) => {
    evt.payload.foo = 'bar';
    evt.ack();
});

// add 'foo' consumer
var consumerId = susi.registerConsumer('foo', (evt) => {
    console.log('consumer', JSON.stringify(evt.payload));
});

/**
 * Example  for publishing with promise
 * @param {json} processor/cusomer information
 */
susi.publish({topic : 'foo'})
    .then((evt)=>{
        console.log('finish', JSON.stringify(evt.payload));
        console.log('-----------------------------------');
        susi.unregisterProcessor(processorId);
    })
    .catch((evt , err)=>  {
        console.log('err');
        console.error(err);
    });

susi.publish({topic : 'foo'}).then((evt)=>{
    console.log('finish', JSON.stringify(evt.payload));
    console.log('-----------------------------------');
    susi.unregisterConsumer(consumerId);
});

susi.publish({topic : 'foo'}).then((evt)=>{
    console.log('---------------Done----------------');
     susi.unregisterConsumer(consumerId);
});
