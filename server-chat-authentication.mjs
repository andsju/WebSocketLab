// use ws library - npm install ws
import WebSocket, { WebSocketServer } from 'ws';

// import functions
import { parse } from './libs/functions.mjs';

// import express, express-session
import express from 'express';
import session from 'express-session';

// import http
import http from 'http';

const app = express();
const port = 8081;

app.use(session({
    secret: "foryoureyesonly%tXl!p",
    resave: false,
    saveUninitialized: true
}));

// serve static files
app.use(express.static('public'));

// let core module http use Express server 
const server = http.createServer(app);

app.use(express.json());

let browserSession;

// route ajax post
app.post('/authenticate', (req, res) => {
       
    let result;
    if (["Pippin", "Merry", "Sam"].includes(req.body.nickname)) {
        result = {authenticated: true, user: req.body.nickname};
        
        // set browserSession 
        browserSession = req.session;
        browserSession.nickname = req.body.nickname;
    } else {
        result = {authenticated: false};
    }
    res.json(result);
});

// create a new predefined WebSocketServer
const wss = new WebSocketServer({noServer: true});

// listen to upgrade event
server.on('upgrade', (req, socket, head) => {

    // some authentication...
    if (browserSession === undefined) {
        socket.write('HTTP/1.1 401 Unauthorized\r\nWWW-Authenticate: Basic\r\n\r\n');
        socket.destroy();
        return;    
    }

    // startup websocket
    wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit('connection', ws, req);
    });
});

// listen to connections on WebSocketServer
wss.on('connection', (ws, req) => {

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

        // use property 'type' to handle message event
        switch (obj.type) {
            
            case "chat":
                
                // broadcast
                wss.broadcastButExclude(JSON.stringify(obj), ws);
                break;
        
            default:

                console.log("Message type is: ", obj.type);
                break;
        }
    })
});

// listen to server requests
server.listen(port, (req, res) => {
    console.log(`Express server running on port: ${port}`);
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