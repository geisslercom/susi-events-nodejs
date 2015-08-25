var crypto = require('crypto');

export default class Susi{
    constructor(){
        this.finishCallbacks = [];
        this.consumers = [];
        this.processors = [];

        this.consumerTopicCounter = {};
        this.processorTopicCounter = {};

        this.publishProcesses = {};
    }
    
    generateId() {
        return crypto.randomBytes(16).toString('hex');
    }

    publish(evt,finishCallback){
        let publishProcess = {
            next: 0,
            processors: [],
            consumers: [],
            finishCallback
        };
        if(!typeof evt.topic === 'string') return false;
        let self = this;

        evt.id = evt.id || this.generateId();
        evt.ack = function() {
            self.ack(evt);
        };
        evt.dismiss = function() {
            self.dismiss(evt);
        };
        for(let p of this.processors){
            if(evt.topic.match(p.topic)) publishProcess.processors.push(p.callback);
        }
        for(let c of this.consumers){
            if(evt.topic.match(c.topic)) publishProcess.consumers.push(c.callback);
        }
        this.publishProcesses[evt.id] = publishProcess;
        var proceed = this.ack(evt);
        let p = new Promise((resolve, reject) => {
            if (proceed) resolve(evt);
        })
        return p;
    }
    
    ack(evt){
        let publishProcess = this.publishProcesses[evt.id];
        if(!publishProcess) return;
        
        let next = publishProcess.next;
        let processors = publishProcess.processors;

        if(next < processors.length){
            publishProcess.next++;
            processors[next](evt);
            return false
        }else{
            for(let ppConsumer of publishProcess.consumers) ppConsumer(evt);
            
            if(typeof publishProcess.finishCallback === 'function') publishProcess.finishCallback(evt);
            
            delete this.publishProcesses[evt.id];
            return true
        }
    };

    dismiss(evt){
        let publishProcess = this.publishProcesses[evt.id];
        if(!publishProcess) return;
        
        for(let ppConsumer of publishProcess.consumers) ppConsumer(evt);
        
        publishProcess.finishCallback(evt);
        delete this.publishProcesses[evt.id];
    };

    registerConsumer(topic,callback){
        let obj = {
            topic,
            callback,
            id : this.generateId()
        }
        this.consumers.push(obj);
        return obj.id;
    };

    registerProcessor(topic,callback){
        let obj = {
            topic,
            callback,
            id : this.generateId()
        }
        this.processors.push(obj);
        return obj.id;
    };

    unregisterConsumer(id){
        let i = 0;
        for(let c of this.consumers){
            if(c.id == id){
                this.consumers.splice(i,1);
                break;
            }
            i++;
        }
    };

    unregisterProcessor(id){
        let i = 0;
        for(let p of this.processors){
            if(p.id == id){
                this.processors.splice(i,1);
                break;
            }
            i++;
        }
    }

}
