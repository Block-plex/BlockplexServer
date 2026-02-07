import $wBmGR$http from "http";
import {WebSocketServer as $wBmGR$WebSocketServer} from "ws";
import {World as $wBmGR$World, Vec3 as $wBmGR$Vec3, Sphere as $wBmGR$Sphere, Cylinder as $wBmGR$Cylinder, Quaternion as $wBmGR$Quaternion, Body as $wBmGR$Body, Box as $wBmGR$Box} from "cannon-es";




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
class $6a767cd48bfac32e$var$CollisionBox {
    constructor(width, height, length, x, y, z, whenCollide, color, masss = 0){
        this.width = width;
        this.height = height;
        this.length = length;
        this.x = x;
        this.y = y;
        this.z = z;
        this.whenCollide = whenCollide;
        this.physics = new $wBmGR$Body({
            mass: masss,
            shape: new $wBmGR$Box(new $wBmGR$Vec3(width / 2, height / 2, length / 2)),
            position: new $wBmGR$Vec3(x, y, z)
        });
        $6a767cd48bfac32e$var$world.addBody(this.physics);
    }
}
setInterval(()=>{
    const snapshot = {
        boxes: []
    };
    for(let i = 0; i < $6a767cd48bfac32e$var$boxes.length; i++){
        const b = $6a767cd48bfac32e$var$boxes[i];
        snapshot.boxes.push({
            x: b.position.x,
            y: b.position.y,
            z: b.position.z,
            qx: b.quaternion.x,
            qy: b.quaternion.y,
            qz: b.quaternion.z,
            qw: b.quaternion.w
        });
    }
    $6a767cd48bfac32e$var$wss.clients.forEach((c)=>c.send(JSON.stringify(snapshot)));
}, 16);
// WebSocket server
const $6a767cd48bfac32e$var$wss = new (0, $wBmGR$WebSocketServer)({
    server: $6a767cd48bfac32e$var$server
});
const $6a767cd48bfac32e$var$boxCol = new $6a767cd48bfac32e$var$CollisionBox(15, 5, 15, 0, -30, 0, function() {}, 0x00FF00);
const $6a767cd48bfac32e$var$boxCol2 = new $6a767cd48bfac32e$var$CollisionBox(10, 5, 10, 20, -30, 0, function() {}, 0x00FF00);
const $6a767cd48bfac32e$var$boxCol3 = new $6a767cd48bfac32e$var$CollisionBox(10, 5, 10, 40, -30, 0, function() {}, 0x00FF00);
const $6a767cd48bfac32e$var$boxCol4 = new $6a767cd48bfac32e$var$CollisionBox(10, 7, 10, 60, -30, 0, function() {}, 0x00FF00);
const $6a767cd48bfac32e$var$boxCol5 = new $6a767cd48bfac32e$var$CollisionBox(10, 25, 10, 80, -30, 0, function() {
    plr.x = 0;
    plr.y = 0;
    plr.z = 0;
}, 0xFFAA00);
const $6a767cd48bfac32e$var$boxCol6 = new $6a767cd48bfac32e$var$CollisionBox(10, 25, 10, 60, -30, 15, function() {}, 0x00FF00);
const $6a767cd48bfac32e$var$boxCol7 = new $6a767cd48bfac32e$var$CollisionBox(10, 25, 10, 60, -30, -15, function() {}, 0x00FF00);
const $6a767cd48bfac32e$var$boxCol8 = new $6a767cd48bfac32e$var$CollisionBox(250, 5, 250, 0, -60, 0, function() {
    plr.x = 0;
    plr.y = 0;
    plr.z = 0;
}, 0xFF0000);
const $6a767cd48bfac32e$var$boxCol9 = new $6a767cd48bfac32e$var$CollisionBox(5, 5, 5, 57, 30, 8, function() {}, 0xFF00FF, 1);
const $6a767cd48bfac32e$var$boxCol10 = new $6a767cd48bfac32e$var$CollisionBox(5, 5, 5, 57, 40, 8, function() {}, 0xFF00FF, 1);
const $6a767cd48bfac32e$var$boxCol11 = new $6a767cd48bfac32e$var$CollisionBox(5, 5, 5, 57, 50, 8, function() {}, 0xFF00FF, 1);
const $6a767cd48bfac32e$var$boxCol12 = new $6a767cd48bfac32e$var$CollisionBox(5, 5, 5, 57, 60, 8, function() {}, 0xFF00FF, 1);
const $6a767cd48bfac32e$var$boxCol13 = new $6a767cd48bfac32e$var$CollisionBox(5, 5, 5, 57, 70, 8, function() {}, 0xFF00FF, 1);
const $6a767cd48bfac32e$var$boxCol14 = new $6a767cd48bfac32e$var$CollisionBox(10, 25, 10, 120, -30, 0, function() {
    plr.x = 0;
    plr.y = 0;
    plr.z = 0;
}, 0x00FF00);
const $6a767cd48bfac32e$var$boxCol15 = new $6a767cd48bfac32e$var$CollisionBox(40, 0.5, 1, 100, 70, 0, function() {}, 0xFF00FF, 1);
const $6a767cd48bfac32e$var$boxes = [
    $6a767cd48bfac32e$var$boxCol,
    $6a767cd48bfac32e$var$boxCol2,
    $6a767cd48bfac32e$var$boxCol3,
    $6a767cd48bfac32e$var$boxCol4,
    $6a767cd48bfac32e$var$boxCol5,
    $6a767cd48bfac32e$var$boxCol6,
    $6a767cd48bfac32e$var$boxCol7,
    $6a767cd48bfac32e$var$boxCol8,
    $6a767cd48bfac32e$var$boxCol9,
    $6a767cd48bfac32e$var$boxCol10,
    $6a767cd48bfac32e$var$boxCol11,
    $6a767cd48bfac32e$var$boxCol12,
    $6a767cd48bfac32e$var$boxCol13,
    $6a767cd48bfac32e$var$boxCol14,
    $6a767cd48bfac32e$var$boxCol15
];
$6a767cd48bfac32e$var$wss.on("connection", (socket)=>{
    const id = Math.random().toString(36).slice(2);
    $6a767cd48bfac32e$var$players[id] = {
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
