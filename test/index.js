//import assert from 'assert'
//import Rx from 'rx'
const assert = require('assert')
const Rx     = require('rx')
const of = Rx.Observable.of
const mqtt = require('mqtt')

const makeMqttDriver = require ('../src/index')
const mqttServer     = require ('./server')



describe("mqtt-driver", function() {
  

  afterEach(()=> {
    //remove test db folder  
  })


  it('lets you subscribe to topics ', (done) => {
    
    const mqttDriver = makeMqttDriver( {host:'localhost', port:1981} )

    const data = {}
    const out$ = of({})

    const server = mqttServer()
    server.listen(1981)

    const testClient  = mqtt.connect( { host: 'localhost', port: 1981 } );
    testClient.on('connect', function () {
      testClient.publish('testTopic', 'some message in testTopic')
    })


    mqttDriver(out$).get("testTopic").forEach(function(message){
      assert.strictEqual( message.toString(), "some message in testTopic" )

      done()
      server.end()
    })
      
  })

  it('lets you send messages to topics ', function(done) {
    this.timeout(5000)
    
    const mqttDriver = makeMqttDriver( {host:'localhost', port:1982} )

    const server = mqttServer()
    server.listen(1982)

    const testClient  = mqtt.connect( { host: 'localhost', port: 1982 } );
    testClient.subscribe('outTestTopic')
    
    testClient.on('message', function (topic, message) {
      assert.strictEqual( message.toString(), "(OUT)message in a bottle" )
  
      done()
      server.end()
    })


    const out$ = of({topic:"outTestTopic",message:"(OUT)message in a bottle"})
      .delay(100)
    mqttDriver(out$)

    
  })

})