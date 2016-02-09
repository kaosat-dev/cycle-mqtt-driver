'use strict';

//import Rx from 'rx'
var Rx = require('rx');
var mqtt = require('mqtt');

module.exports = function makeMqttDriver(_ref) {
  var host = _ref.host;
  var port = _ref.port;

  var client = mqtt.connect({ host: host, port: port });

  function get(topic) {
    client.subscribe(topic);

    return Rx.Observable.create(function (observer) {
      client.on('message', function (_topic, message) {
        if (topic === _topic) {
          observer.onNext(message);
        }
      });

      return function dispose() {
        //not sure how to deal with dispoe ?
        //perhaps like this ? client.unsubscribe(topic) IF and only if there are no ne left
      };
    });
  }

  function publish(_ref2) {
    var topic = _ref2.topic;
    var message = _ref2.message;

    client.publish(topic, message);
  }

  return function mqttDriver(events$) {
    events$.forEach(function (event) {
      return publish(event);
    });
    return { get: get };
  };
};