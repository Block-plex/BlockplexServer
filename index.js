import $wBmGR$http from "http";
import {WebSocketServer as $wBmGR$WebSocketServer} from "ws";



const $6a767cd48bfac32e$var$PORT = process.env.PORT || 3000;
// HTTP server (for the status page)
const $6a767cd48bfac32e$var$server = (0, $wBmGR$http).createServer((req, res)=>{
    res.writeHead(200, {
        "Content-Type": "text/html"
    });
    res.end(`
    <html>
      <head>
        <title>Blockplex Server</title>
        <style>
          body {
            background: #111;
            color: #0f0;
            font-family: monospace;
            text-align: center;
            padding-top: 100px;
          }
        </style>
      </head>
      <body>
        <h1>Blockplex Multiplayer Server</h1>
        <p>Status: Online</p>
        <h1>Blockplex Server</h1>
        <p>Players online: ${Object.keys(players).length}</p>
      </body>
    </html>
  `);
});
// WebSocket server
const $6a767cd48bfac32e$var$wss = new (0, $wBmGR$WebSocketServer)({
    server: $6a767cd48bfac32e$var$server
});
let $6a767cd48bfac32e$var$players = {};
$6a767cd48bfac32e$var$wss.on("connection", (socket)=>{
    const id = Math.random().toString(36).slice(2);
    $6a767cd48bfac32e$var$players[id] = {
        x: 0,
        y: 0,
        z: 0,
        rot: 0
    };
    // Send the ID to the client
    socket.send(JSON.stringify({
        type: "id",
        id: id
    }));
    socket.on("message", (msg)=>{
        try {
            const data = JSON.parse(msg);
            if (data.type === "update") $6a767cd48bfac32e$var$players[id] = data.state;
            console.log("Received message from", id, ":", data);
        } catch  {}
    });
    socket.on("close", ()=>{
        delete $6a767cd48bfac32e$var$players[id];
    });
});
// Broadcast player list
setInterval(()=>{
    const snapshot = JSON.stringify($6a767cd48bfac32e$var$players);
    $6a767cd48bfac32e$var$wss.clients.forEach((client)=>client.send(snapshot));
}, 33);
$6a767cd48bfac32e$var$server.listen($6a767cd48bfac32e$var$PORT, ()=>{
    console.log("Listening on port", $6a767cd48bfac32e$var$PORT);
});


//# sourceMappingURL=index.js.map
