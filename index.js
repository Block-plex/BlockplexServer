import $wBmGR$http from "http";
import {WebSocketServer as $wBmGR$WebSocketServer} from "ws";
import {World as $wBmGR$World, Vec3 as $wBmGR$Vec3, Sphere as $wBmGR$Sphere, Cylinder as $wBmGR$Cylinder, Quaternion as $wBmGR$Quaternion, Body as $wBmGR$Body, Box as $wBmGR$Box} from "cannon-es";
import $wBmGR$fs from "fs";


      var $parcel$global = globalThis;
    
var $parcel$modules = {};
var $parcel$inits = {};

var parcelRequire = $parcel$global["parcelRequire0208"];

if (parcelRequire == null) {
  parcelRequire = function(id) {
    if (id in $parcel$modules) {
      return $parcel$modules[id].exports;
    }
    if (id in $parcel$inits) {
      var init = $parcel$inits[id];
      delete $parcel$inits[id];
      var module = {id: id, exports: {}};
      $parcel$modules[id] = module;
      init.call(module.exports, module, module.exports);
      return module.exports;
    }
    var err = new Error("Cannot find module '" + id + "'");
    err.code = 'MODULE_NOT_FOUND';
    throw err;
  };

  parcelRequire.register = function register(id, init) {
    $parcel$inits[id] = init;
  };

  $parcel$global["parcelRequire0208"] = parcelRequire;
}

var parcelRegister = parcelRequire.register;
parcelRegister("98HlL", function(module, exports) {




const PORT = 3000;
let mapData = [];
function loadMap() {
    const raw = "0.0,-5.0,0.0,26.0,1.0,20.0,255.0,176.0,0.0\n0.5,-5.0,-17.0,7.0,1.0,8.0,31.0,128.0,29.0\n0.5,-5.0,-29.0,7.0,1.0,8.0,31.0,128.0,29.0\n0.0,-5.0,-42.0,18.0,1.0,8.0,31.0,128.0,29.0\n-6.5,2.0,-42.0,5.0,15.0,8.0,31.0,128.0,29.0\n6.5,2.0,-42.0,5.0,15.0,8.0,31.0,128.0,29.0\n1.0,0.5,-42.0,4.0,4.0,4.0,255.0,0.0,191.0\n0.0,6.5,-42.0,4.0,4.0,4.0,255.0,0.0,191.0\n0.0,14.5,-39.0,4.0,4.0,4.0,255.0,0.0,191.0\n-9.0,15.5,-42.0,4.0,4.0,4.0,255.0,0.0,191.0\n-21.0,12.0,-42.0,10.0,7.0,8.0,148.0,190.0,129.0\n-31.5,15.0,-42.0,3.0,1.0,8.0,0.0,255.0,255.0\n-41.5,15.0,-42.0,13.0,1.0,14.0,193.0,190.0,66.0\n-41.5,20.0,-35.5,13.0,11.0,1.0,163.0,162.0,165.0\n-41.5,20.0,-48.5,13.0,11.0,1.0,163.0,162.0,165.0\n-47.5,20.0,-42.0,12.0,11.0,1.0,163.0,162.0,165.0\n-41.5,26.0,-42.0,13.0,1.0,14.0,163.0,162.0,165.0\n-35.5,20.0,-38.0,4.0,11.0,1.0,163.0,162.0,165.0\n-35.5,20.0,-46.0,4.0,11.0,1.0,163.0,162.0,165.0\n-35.5,24.0,-42.0,4.0,3.0,1.0,163.0,162.0,165.0\n-41.5,20.0,-35.5,13.0,11.0,1.0,193.0,190.0,66.0\n-35.5,24.0,-42.0,4.0,3.0,1.0,193.0,190.0,66.0\n-35.5,20.0,-46.0,4.0,11.0,1.0,193.0,190.0,66.0\n-35.5,20.0,-38.0,4.0,11.0,1.0,193.0,190.0,66.0\n-41.5,26.0,-42.0,13.0,1.0,14.0,193.0,190.0,66.0\n-41.5,20.0,-48.5,13.0,11.0,1.0,193.0,190.0,66.0\n-47.5,20.0,-42.0,12.0,11.0,1.0,193.0,190.0,66.0\n".trim().split("\n");
    mapData = raw.map((line)=>{
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
    console.log("Map reloaded:", mapData.length, "blocks");
}
loadMap();
let players = {};
const world = new $wBmGR$World({
    gravity: new $wBmGR$Vec3(0, -9.82, 0)
});
const fixedTimeStep = 1 / 60;
function createCapsule(radius, height) {
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
const server = (0, $wBmGR$http).createServer((req1, res1)=>{
    res1.writeHead(200, {
        "Content-Type": "text/html"
    });
    res1.end(`
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
        <h6>Add on /admin to this page to manage the map.</h6>
      </body>
    </html>
  `);
});
class CollisionBox {
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
        world.addBody(this.physics);
    }
}
server.on("request", (req1, res1)=>{
    if (req1.method === "POST" && req1.url === "/setmap") {
        let body = "";
        req1.on("data", (chunk)=>body += chunk);
        req1.on("end", ()=>{
            (0, $wBmGR$fs).writeFileSync("obby.txt", body);
            loadMap();
            // Broadcast new map to all players
            const packet = JSON.stringify({
                type: "map",
                data: mapData
            });
            wss.clients.forEach((c)=>c.send(packet));
            res1.writeHead(200);
            res1.end("Map updated");
        });
        return;
    }
});
if (req.method === "GET" && req.url === "/admin") {
    res.writeHead(200, {
        "Content-Type": "text/html"
    });
    res.end(Buffer.from("PCFET0NUWVBFIGh0bWw+DQo8aHRtbCBsYW5nPSJlbiI+DQo8aGVhZD4NCiAgICA8bWV0YSBjaGFyc2V0PSJVVEYtOCI+DQogICAgPG1ldGEgbmFtZT0idmlld3BvcnQiIGNvbnRlbnQ9IndpZHRoPWRldmljZS13aWR0aCwgaW5pdGlhbC1zY2FsZT0xLjAiPg0KICAgIDx0aXRsZT5BZG1pbiBQYWdlPC90aXRsZT4NCjwvaGVhZD4NCjxib2R5Pg0KICAgIDx0ZXh0YXJlYSBpZD0ibWFwIiBzdHlsZT0id2lkdGg6MTAwJTtoZWlnaHQ6MzAwcHg7Ij48L3RleHRhcmVhPg0KPGJ1dHRvbiBvbmNsaWNrPSJ1cGxvYWQoKSI+VXBsb2FkIE1hcDwvYnV0dG9uPg0KDQo8c2NyaXB0Pg0KZnVuY3Rpb24gdXBsb2FkKCkgew0KICAgIGZldGNoKCIvc2V0bWFwIiwgew0KICAgICAgICBtZXRob2Q6ICJQT1NUIiwNCiAgICAgICAgYm9keTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoIm1hcCIpLnZhbHVlDQogICAgfSkudGhlbihyID0+IGFsZXJ0KCJNYXAgdXBkYXRlZCEiKSk7DQp9DQo8L3NjcmlwdD4NCjwvYm9keT4NCjwvaHRtbD4=", "base64"));
    return;
}
setInterval(()=>{
    world.step(fixedTimeStep);
    const snapshot = {
        type: "state",
        boxes: [],
        players: {}
    };
    for(let i = 0; i < boxes.length; i++){
        const b = boxes[i];
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
    for(const id in players){
        const p = players[id];
        snapshot.players[id] = {
            x: p.input.x,
            y: p.input.y,
            z: p.input.z,
            angle: p.input.angle
        };
    }
    wss.clients.forEach((c)=>c.send(JSON.stringify(snapshot)));
}, 16);
// WebSocket server
const wss = new (0, $wBmGR$WebSocketServer)({
    server: server
});
const boxes = mapData.map((data)=>new CollisionBox(data.size.x, data.size.y, data.size.z, data.pos.x, data.pos.y, data.pos.z, function() {}, data.color));
wss.on("connection", (socket)=>{
    const id = Math.random().toString(36).slice(2);
    /* what player sends:
socket.send(JSON.stringify({
        type: "input",
        x: plr.x,
        y: plr.y,
        z: plr.z,
        angle: cameraLookaroundAngle
        }));
  */ players[id] = {
        input: {
            x: 0,
            y: 0,
            z: 0,
            angle: 0,
            body: createCapsule(1.5, 12)
        }
    };
    world.addBody(players[id].input.body);
    const body = players[id].input.body;
    // Send the ID to the client
    socket.send(JSON.stringify({
        type: "id",
        id: id
    }));
    socket.send(JSON.stringify({
        type: "map",
        data: mapData
    }));
    console.log("Sending map data to", id, " with map data ", mapData);
    socket.on("message", (msg)=>{
        try {
            const data = JSON.parse(msg);
            if (data.type === "input") {
                players[id].input = data;
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
                wss.clients.forEach((c)=>c.send(chatPacket));
            }
        } catch  {}
    });
    socket.on("close", ()=>{
        delete players[id];
    });
});
server.listen(PORT, ()=>{
    console.log("Listening on port", PORT);
});

});


parcelRequire("98HlL");

//# sourceMappingURL=index.js.map
