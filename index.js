import $wBmGR$http from "http";
import {WebSocketServer as $wBmGR$WebSocketServer} from "ws";
import {World as $wBmGR$World, Vec3 as $wBmGR$Vec3, Sphere as $wBmGR$Sphere, Cylinder as $wBmGR$Cylinder, Quaternion as $wBmGR$Quaternion, Body as $wBmGR$Body, Box as $wBmGR$Box} from "cannon-es";
import "fs";





const $6a767cd48bfac32e$var$PORT = 3000;
const $6a767cd48bfac32e$var$rawMap = "0.0,-5.0,0.0,26.0,1.0,20.0,255.0,176.0,0.0\n0.5,-5.0,-17.0,7.0,1.0,8.0,31.0,128.0,29.0\n0.5,-5.0,-29.0,7.0,1.0,8.0,31.0,128.0,29.0\n0.0,-5.0,-42.0,18.0,1.0,8.0,31.0,128.0,29.0\n-6.5,2.0,-42.0,5.0,15.0,8.0,31.0,128.0,29.0\n6.5,2.0,-42.0,5.0,15.0,8.0,31.0,128.0,29.0\n1.0,0.5,-42.0,4.0,4.0,4.0,255.0,0.0,191.0\n0.0,6.5,-42.0,4.0,4.0,4.0,255.0,0.0,191.0\n0.0,14.5,-39.0,4.0,4.0,4.0,255.0,0.0,191.0\n-9.0,15.5,-42.0,4.0,4.0,4.0,255.0,0.0,191.0\n-21.0,12.0,-42.0,10.0,7.0,8.0,148.0,190.0,129.0\n-31.5,15.0,-42.0,3.0,1.0,8.0,0.0,255.0,255.0\n-41.5,15.0,-42.0,13.0,1.0,14.0,193.0,190.0,66.0\n-41.5,20.0,-35.5,13.0,11.0,1.0,163.0,162.0,165.0\n-41.5,20.0,-48.5,13.0,11.0,1.0,163.0,162.0,165.0\n-47.5,20.0,-42.0,12.0,11.0,1.0,163.0,162.0,165.0\n-41.5,26.0,-42.0,13.0,1.0,14.0,163.0,162.0,165.0\n-35.5,20.0,-38.0,4.0,11.0,1.0,163.0,162.0,165.0\n-35.5,20.0,-46.0,4.0,11.0,1.0,163.0,162.0,165.0\n-35.5,24.0,-42.0,4.0,3.0,1.0,163.0,162.0,165.0\n-41.5,20.0,-35.5,13.0,11.0,1.0,193.0,190.0,66.0\n-35.5,24.0,-42.0,4.0,3.0,1.0,193.0,190.0,66.0\n-35.5,20.0,-46.0,4.0,11.0,1.0,193.0,190.0,66.0\n-35.5,20.0,-38.0,4.0,11.0,1.0,193.0,190.0,66.0\n-41.5,26.0,-42.0,13.0,1.0,14.0,193.0,190.0,66.0\n-41.5,20.0,-48.5,13.0,11.0,1.0,193.0,190.0,66.0\n-47.5,20.0,-42.0,12.0,11.0,1.0,193.0,190.0,66.0\n".trim().split("\n");
const $6a767cd48bfac32e$var$mapData = $6a767cd48bfac32e$var$rawMap.map((line)=>{
    const nums = line.split(",").map(Number);
    return {
        pos: {
            x: nums[0],
            y: nums[1],
            z: nums[2]
        },
        size: {
            x: nums[3],
            y: nums[4],
            z: nums[5]
        },
        color: {
            r: nums[6],
            g: nums[7],
            b: nums[8]
        }
    };
});
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
    $6a767cd48bfac32e$var$world.step($6a767cd48bfac32e$var$fixedTimeStep);
    const snapshot = {
        type: "state",
        boxes: [],
        players: {}
    };
    for(let i = 0; i < $6a767cd48bfac32e$var$boxes.length; i++){
        const b = $6a767cd48bfac32e$var$boxes[i];
        snapshot.boxes.push({
            x: b.physics.position.x,
            y: b.physics.position.y,
            z: b.physics.position.z,
            qx: b.physics.quaternion.x,
            qy: b.physics.quaternion.y,
            qz: b.physics.quaternion.z,
            qw: b.physics.quaternion.w
        });
    }
    for(const id in $6a767cd48bfac32e$var$players){
        const p = $6a767cd48bfac32e$var$players[id];
        snapshot.players[id] = {
            x: p.input.x,
            y: p.input.y,
            z: p.input.z,
            angle: p.input.angle
        };
    }
    $6a767cd48bfac32e$var$wss.clients.forEach((c)=>c.send(JSON.stringify(snapshot)));
}, 16);
// WebSocket server
const $6a767cd48bfac32e$var$wss = new (0, $wBmGR$WebSocketServer)({
    server: $6a767cd48bfac32e$var$server
});
const $6a767cd48bfac32e$var$boxes = $6a767cd48bfac32e$var$mapData.map((data)=>new $6a767cd48bfac32e$var$CollisionBox(data.size.x, data.size.y, data.size.z, data.pos.x, data.pos.y, data.pos.z, function() {}, data.color));
$6a767cd48bfac32e$var$wss.on("connection", (socket)=>{
    const id = Math.random().toString(36).slice(2);
    /* what player sends:
socket.send(JSON.stringify({
        type: "input",
        x: plr.x,
        y: plr.y,
        z: plr.z,
        angle: cameraLookaroundAngle
        }));
  */ $6a767cd48bfac32e$var$players[id] = {
        input: {
            x: 0,
            y: 0,
            z: 0,
            angle: 0,
            body: $6a767cd48bfac32e$var$createCapsule(1.5, 12)
        }
    };
    $6a767cd48bfac32e$var$world.addBody($6a767cd48bfac32e$var$players[id].input.body);
    const body = $6a767cd48bfac32e$var$players[id].input.body;
    // Send the ID to the client
    socket.send(JSON.stringify({
        type: "id",
        id: id
    }));
    socket.send(JSON.stringify({
        type: "map",
        data: $6a767cd48bfac32e$var$mapData
    }));
    socket.on("message", (msg)=>{
        try {
            const data = JSON.parse(msg);
            if (data.type === "input") {
                $6a767cd48bfac32e$var$players[id].input = data;
                body.position.x = data.x;
                body.position.y = data.y;
                body.position.z = data.z;
                body.quaternion.setFromEuler(0, data.angle, 0);
            }
            if (data.type === "chat") {
                // Broadcast to everyone 
                const chatPacket = JSON.stringify({
                    type: "chat",
                    from: id,
                    message: data.sender + ": " + data.message
                });
                $6a767cd48bfac32e$var$wss.clients.forEach((c)=>c.send(chatPacket));
            }
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
