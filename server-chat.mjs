// use ws library - npm install ws
import { WebSocketServer } from 'ws';

// import functions
import { parse } from './libs/functions.mjs';

// create a new WebSocketServer
const wss = new WebSocketServer({port: 8081});

// listen to connections on WebSocketServer
wss.on('connection', (ws) => {

    // WebSocket for every single client
    console.log('New client connection: ', ws._socket.remoteAddress);
    console.log('Number of clients: ', wss.clients.size);
    

    // listen to event: close
    ws.on('close', (event) => {
        console.log('Client disconnected\n');
        console.log('Number of clients: ', wss.clients.size);
    });

    // listen to event: message 
    ws.on('message', (data) => {
        console.log('Message received: %s', data);

        // use parse function
        let obj = parse(data);

        console.log(obj);
    })
});


// broadcast functions

wss.broadcast = function(data) {
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

wss.broadcastButExclude = function(data, someClient) {
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            if (client !== someClient) {
                client.send(data);
            }
        }
    });
}