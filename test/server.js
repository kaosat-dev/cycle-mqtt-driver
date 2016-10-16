var mqttServer = require('mqtt-server')

export default function makeServer ({port}) {
  let clients = {}

  const onClientConnect = (client, packet) => {
    clients[packet.clientId] = client
    client.id = packet.clientId
    // console.log('client connected!', client.id, 'total clients:', Object.keys(clients).map(x => clients[x].id))
    client.subscriptions = []
    client.connack({returnCode: 0})
  }
  const onClientSubscribe = (client, packet) => {
    let granted = []

    for (let i = 0; i < packet.subscriptions.length; i++) {
      let qos = packet.subscriptions[i].qos,
        topic = packet.subscriptions[i].topic,
        reg = new RegExp(topic.replace('+', '[^\/]+').replace('#', '.+') + '$')

      granted.push(qos)
      if (!client.subscriptions) {
        client.subscriptions = []
      }
      client.subscriptions.push(reg)
    }

    client.suback({messageId: packet.messageId, granted: granted})
  }

  const onClientPublish = (client, packet) => {
    // console.log(`publish FROM : ${client.id}, packet ${packet}`)
    // console.log('TO: clients',  Object.keys(clients).map(x => clients[x].id))
    for (var k in clients) {
      var c = clients[k]

      for (var i = 0; i < c.subscriptions.length; i++) {
        var s = c.subscriptions[i]

        if (s.test(packet.topic)) {
          c.publish({topic: packet.topic, payload: packet.payload})
          break
        }
      }
    }
  }

  const onClientClose = (client, packet) => {
    delete clients[client.id]
  }

  const servers = mqttServer({
    mqtt: 'tcp://localhost:' + port
  }, {
    emitEvents: true // default
  }, function (client) {
    client.on('connect', onClientConnect.bind(null, client))
    // client.connect = onClientConnect.bind(null, client)
    client.on('subscribe', onClientSubscribe.bind(null, client))
    client.on('publish', onClientPublish.bind(null, client))

    client.on('pingreq', (packet) => client.pingresp())

    client.on('disconnect', (packet) => client.stream.end())
    client.on('close', onClientClose.bind(null, client))
    client.on('error', (e) => client.stream.end())
  })

  servers.listen(function () {
    // console.log('listening!')
  })

  return servers
}
