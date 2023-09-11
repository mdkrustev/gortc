const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 80 });

const clients = new Set(); // Store connected clients

wss.on('connection', (ws) => {
    console.log('Client connected');
    clients.add(ws); // Add the new client to the set

    ws.on('message', (message) => {
        console.log(`Received: ${message}`);

        // Broadcast the message to all connected clients
        clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(`Server received: ${message}`);
            }
        });
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        clients.delete(ws); // Remove the disconnected client from the set
    });
});

console.log('WebSocket server is running on port 80');
