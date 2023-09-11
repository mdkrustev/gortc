const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');

const server = http.createServer((req, res) => {
    // Serve the "Hello World" page on the root URL
    if (req.url === '/') {
        fs.readFile('index.html', (err, data) => {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading index.html');
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

const wss = new WebSocket.Server({ server });

// WebSocket server logic
wss.on('connection', (ws, req) => {
    // Extract the room ID from the URL
    const roomId = req.url.replace('/room/', '');

    // Broadcast messages to all clients in the specific room
    ws.on('message', (message) => {
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                // Check if the client is in the same room
                const clientRoomId = client.roomId || '';
                if (clientRoomId === roomId) {
                    client.send(message);
                }
            }
        });
    });

    // Store the room ID with the WebSocket connection
    ws.roomId = roomId;
});
// Start the server
const PORT = 80;
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
