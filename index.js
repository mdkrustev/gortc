const WebSocket = require('ws');
const http = require('http');
const url = require('url');
const fs = require('fs');

const server = http.createServer((req, res) => {
    fs.readFile(`${__dirname}/index.html`, (err, data) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
        } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        }
    });
});

const wss = new WebSocket.Server({ noServer: true });

// Store connected clients and their respective rooms
const clients = new Map();

wss.on('connection', (ws, req) => {
    const { pathname } = url.parse(req.url);

    // Extract the room ID from the URL
    const roomId = pathname.split('/').pop();

    if (!roomId) {
        ws.close(4000, 'Invalid room ID');
        return;
    }

    // Store the WebSocket connection in the appropriate room
    if (!clients.has(roomId)) {
        clients.set(roomId, new Set());
    }

    clients.get(roomId).add(ws);

    ws.on('message', (message) => {
        // Broadcast the message to all clients in the room
        console.log(message.toString())
        const roomClients = clients.get(roomId);
        if (roomClients) {
            roomClients.forEach((client) => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(message.toString());
                }
            });
        }
    });

    ws.on('close', () => {
        // Remove the WebSocket connection from the room
        const roomClients = clients.get(roomId);
        if (roomClients) {
            roomClients.delete(ws);
            if (roomClients.size === 0) {
                clients.delete(roomId);
            }
        }
    });
});

server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});

const port = process.env.PORT || 8080;
const host = '127.0.0.1';

server.listen(port, host, () => {
    console.log(`WebSocket server is listening on ws://${host}:${port}`);
});




