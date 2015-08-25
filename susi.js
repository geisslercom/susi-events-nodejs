'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var crypto = require('crypto');

var Susi = (function () {
    function Susi() {
        _classCallCheck(this, Susi);

        this.finishCallbacks = [];
        this.consumers = [];
        this.processors = [];

        this.consumerTopicCounter = {};
        this.processorTopicCounter = {};

        this.publishProcesses = {};
        this.publishPromise;
    }

    _createClass(Susi, [{
        key: 'generateId',
        value: function generateId() {
            return crypto.randomBytes(16).toString('hex');
        }
    }, {
        key: 'publish',
        value: function publish(evt) {
            var _this = this;

            this.publishPromise = new Promise(function (resolve, reject) {
                var publishProcess = {
                    next: 0,
                    processors: [],
                    consumers: [],
                    resolve: resolve
                };
                if (! typeof evt.topic === 'string') return false;
                var self = _this;

                evt.id = evt.id || _this.generateId();
                evt.ack = function () {
                    self.ack(evt);
                };
                evt.dismiss = function () {
                    self.dismiss(evt);
                };
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = _this.processors[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var p = _step.value;

                        if (evt.topic.match(p.topic)) publishProcess.processors.push(p.callback);
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator['return']) {
                            _iterator['return']();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }

                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = _this.consumers[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var c = _step2.value;

                        if (evt.topic.match(c.topic)) publishProcess.consumers.push(c.callback);
                    }
                } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion2 && _iterator2['return']) {
                            _iterator2['return']();
                        }
                    } finally {
                        if (_didIteratorError2) {
                            throw _iteratorError2;
                        }
                    }
                }

                _this.publishProcesses[evt.id] = publishProcess;
                _this.ack(evt);
            });
            return this.publishPromise;
        }
    }, {
        key: 'ack',
        value: function ack(evt) {
            var publishProcess = this.publishProcesses[evt.id];
            if (!publishProcess) return;

            var next = publishProcess.next;
            var processors = publishProcess.processors;

            if (next < processors.length) {
                publishProcess.next++;
                processors[next](evt);
            } else {
                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = publishProcess.consumers[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var ppConsumer = _step3.value;
                        ppConsumer(evt);
                    }
                } catch (err) {
                    _didIteratorError3 = true;
                    _iteratorError3 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion3 && _iterator3['return']) {
                            _iterator3['return']();
                        }
                    } finally {
                        if (_didIteratorError3) {
                            throw _iteratorError3;
                        }
                    }
                }

                publishProcess.resolve(evt);

                delete this.publishProcesses[evt.id];
            }
        }
    }, {
        key: 'dismiss',
        value: function dismiss(evt) {
            var publishProcess = this.publishProcesses[evt.id];
            if (!publishProcess) return;

            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = publishProcess.consumers[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var ppConsumer = _step4.value;
                    ppConsumer(evt);
                }
            } catch (err) {
                _didIteratorError4 = true;
                _iteratorError4 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion4 && _iterator4['return']) {
                        _iterator4['return']();
                    }
                } finally {
                    if (_didIteratorError4) {
                        throw _iteratorError4;
                    }
                }
            }

            publishProcess.finishCallback(evt);
            delete this.publishProcesses[evt.id];
        }
    }, {
        key: 'registerConsumer',
        value: function registerConsumer(topic, callback) {
            var obj = {
                topic: topic,
                callback: callback,
                id: this.generateId()
            };
            this.consumers.push(obj);
            return obj.id;
        }
    }, {
        key: 'registerProcessor',
        value: function registerProcessor(topic, callback) {
            var obj = {
                topic: topic,
                callback: callback,
                id: this.generateId()
            };
            this.processors.push(obj);
            return obj.id;
        }
    }, {
        key: 'unregisterConsumer',
        value: function unregisterConsumer(id) {
            var i = 0;
            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = this.consumers[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var c = _step5.value;

                    if (c.id == id) {
                        this.consumers.splice(i, 1);
                        break;
                    }
                    i++;
                }
            } catch (err) {
                _didIteratorError5 = true;
                _iteratorError5 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion5 && _iterator5['return']) {
                        _iterator5['return']();
                    }
                } finally {
                    if (_didIteratorError5) {
                        throw _iteratorError5;
                    }
                }
            }
        }
    }, {
        key: 'unregisterProcessor',
        value: function unregisterProcessor(id) {
            var i = 0;
            var _iteratorNormalCompletion6 = true;
            var _didIteratorError6 = false;
            var _iteratorError6 = undefined;

            try {
                for (var _iterator6 = this.processors[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                    var p = _step6.value;

                    if (p.id == id) {
                        this.processors.splice(i, 1);
                        break;
                    }
                    i++;
                }
            } catch (err) {
                _didIteratorError6 = true;
                _iteratorError6 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion6 && _iterator6['return']) {
                        _iterator6['return']();
                    }
                } finally {
                    if (_didIteratorError6) {
                        throw _iteratorError6;
                    }
                }
            }
        }
    }]);

    return Susi;
})();

exports['default'] = Susi;
module.exports = exports['default'];
