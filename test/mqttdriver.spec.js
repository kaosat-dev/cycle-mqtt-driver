import test from 'ava'
import { of } from 'most'
import mqtt from 'mqtt'
import mqttServer from './server'
import makeMqttDriver from '../src/index'

test.cb('lets you subscribe to topics', t => {

  const out$ = of({})
  const server = mqttServer({port: 1981})

  const mqttDriver = makeMqttDriver({host: 'localhost', port: 1981})

  const testClient = mqtt.connect({ host: 'localhost', port: 1981 })
  testClient.on('connect', function () {
    testClient.publish('testTopic', 'some message in testTopic')
  })

  mqttDriver(out$).get('testTopic').forEach(function (message) {
    t.deepEqual(message.toString(), 'some message in testTopic')
    t.end()
    server.destroy()
  })
})

test('lets you send messages to topics', t => {
  const server = mqttServer({port: 1982})

  const mqttDriver = makeMqttDriver({host: 'localhost', port: 1982})

  const testClient = mqtt.connect({ host: 'localhost', port: 1982 })
  testClient.subscribe('outTestTopic')

  testClient.on('message', function (topic, message) {
    t.deepEqual(message.toString(), '(OUT)message in a bottle')
    t.end()
    server.destroy()
  })

  const out$ = of({topic: 'outTestTopic', message: '(OUT)message in a bottle'})
    .delay(100)

  mqttDriver(out$)
})
