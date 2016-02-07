//import Rx from 'rx'
const Rx   = require('rx')
const mqtt = require('mqtt')


module.exports = function makeMqttDriver({host, port}){

    const client  = mqtt.connect( { host, port } )

    function get(topic) {
      client.subscribe(topic)

      return Rx.Observable.create(observer => {
          client.on('message', function (_topic, message) {
            if(topic === _topic){
              observer.onNext(message)
            }
          })

          return function dispose() {
            //not sure how to deal with dispoe ?
            //perhaps like this ? client.unsubscribe(topic) IF and only if there are no ne left
          }
      })
    }

    function publish({topic, message}) {
      client.publish(topic, message)
    }

    return function mqttDriver(events$) {
      events$.forEach(event => publish(event))
      return {get}
    }

}