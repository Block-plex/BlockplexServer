import $wBmGR$http from "http";
import {WebSocketServer as $wBmGR$WebSocketServer} from "ws";



const $6a767cd48bfac32e$var$PORT = process.env.PORT || 3000;
const $6a767cd48bfac32e$var$server = (0, $wBmGR$http).createServer((req, res)=>{
    res.writeHead(200);
    res.end("Server is running!");
});
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
            // Only update if it's a player update
            if (data.type === "update") $6a767cd48bfac32e$var$players[id] = data.state;
            console.log("Received message from", id, ":", data);
        } catch  {}
    });
    socket.on("close", ()=>{
        delete $6a767cd48bfac32e$var$players[id];
    });
});
// Send all players to everyone 30 times per second
setInterval(()=>{
    const snapshot = JSON.stringify($6a767cd48bfac32e$var$players);
    $6a767cd48bfac32e$var$wss.clients.forEach((client)=>client.send(snapshot));
}, 33);
$6a767cd48bfac32e$var$server.listen($6a767cd48bfac32e$var$PORT, ()=>{
    console.log("Listening on port", $6a767cd48bfac32e$var$PORT);
});


//# sourceMappingURL=index.js.map
