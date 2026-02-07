import $wBmGR$http from "http";
import {WebSocketServer as $wBmGR$WebSocketServer} from "ws";
import {World as $wBmGR$World, Vec3 as $wBmGR$Vec3, Sphere as $wBmGR$Sphere, Cylinder as $wBmGR$Cylinder, Quaternion as $wBmGR$Quaternion, Body as $wBmGR$Body} from "cannon-es";




const $6a767cd48bfac32e$var$PORT = process.env.PORT || 3000;
let $6a767cd48bfac32e$var$players = {};
const $6a767cd48bfac32e$var$world = new $wBmGR$World({
    gravity: new $wBmGR$Vec3(0, -9.82, 0)
});
const $6a767cd48bfac32e$var$fixedTimeStep = 1 / 60;
function $6a767cd48bfac32e$var$createCapsule(radius, height) {
    const sphereShape = new $wBmGR$Sphere(radius);
    const cylinderShape = new $wBmGR$Cylinder(radius, radius, height, 8);
    const quat = new $wBmGR$Quaternion();
    quat.setFromEuler(Math.PI / 2, 0, 0);
    const compound = new $wBmGR$Body({
        mass: 1
    });
    compound.addShape(cylinderShape, new $wBmGR$Vec3(0, 0, 0), quat);
    compound.addShape(sphereShape, new $wBmGR$Vec3(0, height / 2, 0));
    compound.addShape(sphereShape, new $wBmGR$Vec3(0, -height / 2, 0));
    return compound;
}
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
        <p>Players online: ${Object.keys($6a767cd48bfac32e$var$players).length}</p>
      </body>
    </html>
  `);
});
setInterval(()=>{
    for(const id in $6a767cd48bfac32e$var$players){
        const p = $6a767cd48bfac32e$var$players[id];
        const body = p.body;
        const input = p.input;
        const speed = 10;
        // Reset horizontal velocity
        body.velocity.x = 0;
        body.velocity.z = 0;
        if (input.w) {
            body.velocity.z = -speed * Math.cos(input.angle * Math.PI / 180);
            body.velocity.x = -speed * Math.sin(input.angle * Math.PI / 180);
        }
        if (input.s) {
            body.velocity.z = speed * Math.cos(input.angle * Math.PI / 180);
            body.velocity.x = speed * Math.sin(input.angle * Math.PI / 180);
        }
        if (input.a) {
            body.velocity.x = -speed * Math.cos(input.angle * Math.PI / 180);
            body.velocity.z = speed * Math.sin(input.angle * Math.PI / 180);
        }
        if (input.d) {
            body.velocity.x = speed * Math.cos(input.angle * Math.PI / 180);
            body.velocity.z = -speed * Math.sin(input.angle * Math.PI / 180);
        }
    }
}, 1000);
setInterval(()=>{
    $6a767cd48bfac32e$var$world.step($6a767cd48bfac32e$var$fixedTimeStep);
    const snapshot = {};
    for(const id in $6a767cd48bfac32e$var$players){
        const body = $6a767cd48bfac32e$var$players[id].body;
        snapshot[id] = {
            x: body.position.x,
            y: body.position.y,
            z: body.position.z,
            qx: body.quaternion.x,
            qy: body.quaternion.y,
            qz: body.quaternion.z,
            qw: body.quaternion.w
        };
    }
    $6a767cd48bfac32e$var$wss.clients.forEach((c)=>c.send(JSON.stringify(snapshot)));
}, 16);
// WebSocket server
const $6a767cd48bfac32e$var$wss = new (0, $wBmGR$WebSocketServer)({
    server: $6a767cd48bfac32e$var$server
});
$6a767cd48bfac32e$var$wss.on("connection", (socket)=>{
    const id = Math.random().toString(36).slice(2);
    const body = $6a767cd48bfac32e$var$createCapsule(1.5, 12);
    body.position.set(0, 10, 0);
    $6a767cd48bfac32e$var$world.addBody(body);
    $6a767cd48bfac32e$var$players[id] = {
        body: body,
        input: {
            w: 0,
            a: 0,
            s: 0,
            d: 0
        }
    };
    // Send the ID to the client
    socket.send(JSON.stringify({
        type: "id",
        id: id
    }));
    socket.on("message", (msg)=>{
        try {
            const data = JSON.parse(msg);
            if (data.type === "input") $6a767cd48bfac32e$var$players[id].input = data;
            console.log("Received message from", id, ":", data);
        } catch  {}
    });
    socket.on("close", ()=>{
        delete $6a767cd48bfac32e$var$players[id];
    });
});
$6a767cd48bfac32e$var$server.listen($6a767cd48bfac32e$var$PORT, ()=>{
    console.log("Listening on port", $6a767cd48bfac32e$var$PORT);
});


//# sourceMappingURL=index.js.map
