'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = makeMqttDriver;

var _mqtt = require('mqtt');

var _mqtt2 = _interopRequireDefault(_mqtt);

var _create = require('@most/create');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function makeMqttDriver(_ref) {
  var host = _ref.host;
  var port = _ref.port;

  var client = _mqtt2.default.connect({ host: host, port: port, clientId: 'foobaz' });

  function get(topic) {
    client.subscribe(topic);

    return (0, _create.create)(function (add, end, error) {
      client.on('message', function (_topic, message) {
        if (topic === _topic) {
          add(message);
        }
      });
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
}