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

//basic Promises
susi.publish({topic: 'foo'}).then(function(evt){
    console.log('finish#1', JSON.stringify(evt.payload));
    susi.unregisterProcessor(processorId);
})

susi.publish({topic : 'foo'}).then(function(evt){
    console.log('finish#2', JSON.stringify(evt.payload));
    susi.unregisterConsumer(consumerId);
})

susi.publish({topic : 'foo'}).then(function(evt){
    console.log('finish#3', JSON.stringify(evt.payload));
})

//example using generators WIP

    // Promise.coroutine(function* (){
    //     var SusiFoo = yield susi.publish({topic : 'foo'});
    //     console.log("SusiPublishes" , SusiFoo)

    //     var ShengFoo = yield susi.publish({topic : 'bar'});
    //     console.log("barPublish", ShengFoo)
    // })
 
