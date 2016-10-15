import mqtt from 'mqtt'
import {create} from '@most/create'

export default function makeMqttDriver ({ host, port }) {
  const client = mqtt.connect({ host, port, clientId:'foobaz' })

  function get (topic) {
    client.subscribe(topic)

    return create((add, end, error) => {
      client.on('message', function (_topic, message) {
        if (topic === _topic) {
          add(message)
        }
      })
    })
  }

  function publish ({topic, message}) {
    client.publish(topic, message)
  }

  return function mqttDriver (events$) {
    events$.forEach(event => publish(event))
    return {get}
  }
}
