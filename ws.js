const WebSocket = require('ws')
const fs = require('fs')

const wss = new WebSocket.Server({ port: 8080 })

wss.on('connection', (ws) => {
  console.log('Client connected')

  const watchFile = './dist'

  fs.watch(watchFile, (eventType, filename) => {
    if (filename && eventType === 'change') {
      ws.send('File changed')
    }
  })
})
