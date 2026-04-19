import http from "http";
import { WebSocketServer } from "ws";

const PORT = 3000;

import fs from "fs";

let mapData = [];
let boxes = [];

function loadMap() {
    const raw = fs.readFileSync("obby.txt", "utf8").trim().split("\n");

    mapData = raw.map(line => {
        const nums = line.split(",").map(Number);
        return {
            pos: { x: nums[0], y: nums[1], z: nums[2] },
            size: { x: nums[3], y: nums[4], z: nums[5] },
            color: { r: nums[6], g: nums[7], b: nums[8] }
        };
    });

    console.log("Map reloaded:", mapData.length, "blocks");
}

loadMap();
rebuildBoxes();

let players = {};

import * as CANNON from "cannon-es";

const world = new CANNON.World({
  gravity: new CANNON.Vec3(0, -9.82, 0)
});

class CollisionBox {
    constructor(width, height, length, x, y, z, whenCollide, color, masss = 0) {
        this.width = width;
        this.height = height;
        this.length = length;
        this.x = x;
        this.y = y;
        this.z = z;
        this.whenCollide = whenCollide;
        this.physics = new CANNON.Body({
            mass: masss,
            shape: new CANNON.Box(new CANNON.Vec3(width/2, height/2, length/2)),
            position: new CANNON.Vec3(x, y, z)
        });
        world.addBody(this.physics);
    }
}

const fixedTimeStep = 1 / 60;

function createCapsule(radius, height) {
  const sphereShape = new CANNON.Sphere(radius);
  const cylinderShape = new CANNON.Cylinder(radius, radius, height, 8);

  const quat = new CANNON.Quaternion();
  quat.setFromEuler(Math.PI / 2, 0, 0);

  const compound = new CANNON.Body({ mass: 1 });

  compound.addShape(cylinderShape, new CANNON.Vec3(0, 0, 0), quat);
  compound.addShape(sphereShape, new CANNON.Vec3(0, height / 2, 0));
  compound.addShape(sphereShape, new CANNON.Vec3(0, -height / 2, 0));

  return compound;
}

const server = http.createServer((req, res) => {
    if (req.method === "POST" && req.url === "/setmap") {
        let body = "";

        req.on("data", chunk => body += chunk);
        req.on("end", () => {
          req.on("end", () => {
            fs.writeFileSync("obby.txt", body);
            loadMap();
            rebuildBoxes();   // <-- THIS FIXES EVERYTHING

            const packet = JSON.stringify({ type: "map", data: mapData });
            wss.clients.forEach(c => c.send(packet));

            res.writeHead(200);
            res.end("Map updated");
          });
        });

        return;
    }

    if (req.method === "GET" && req.url === "/admin") {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(fs.readFileSync("admin.html"));
        return;
    }

    // Default status page
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`
        <html>
            <body style="background:#111;color:#0f0;font-family:monospace;text-align:center;padding-top:100px;">
                <h1>Blockplex Multiplayer Server</h1>
                <p>Status: Online</p>
                <p>Players online: ${Object.keys(players).length}</p>
            </body>
        </html>
    `);
});


setInterval(() => {
  world.step(fixedTimeStep);

  const snapshot = { type: "state", boxes: [], players: {} };

  for (let i = 0; i < boxes.length; i++) {
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

  for (const id in players) {
    const p = players[id];
    snapshot.players[id] = {
      x: p.input.x,
      y: p.input.y,
      z: p.input.z,
      angle: p.input.angle
    };
  }

  wss.clients.forEach(c => c.send(JSON.stringify(snapshot)));
}, 16);

// WebSocket server
const wss = new WebSocketServer({ server });

function rebuildBoxes() {
    // Remove old physics bodies
    for (const b of boxes) {
        world.removeBody(b.physics);
    }

    // Create new ones
    boxes = mapData.map(data => new CollisionBox(
        data.size.x,
        data.size.y,
        data.size.z,
        data.pos.x,
        data.pos.y,
        data.pos.z,
        () => {},
        data.color
    ));

    console.log("Physics boxes rebuilt:", boxes.length);
}

wss.on("connection", (socket) => {
  const id = Math.random().toString(36).slice(2);
  /* what player sends:
socket.send(JSON.stringify({
        type: "input",
        x: plr.x,
        y: plr.y,
        z: plr.z,
        angle: cameraLookaroundAngle
        }));
  */

  players[id] = {
    input: { x: 0, y: 0, z: 0, angle: 0, body: createCapsule(1.5, 12) }
  };

  world.addBody(players[id].input.body);
  const body = players[id].input.body;

  // Send the ID to the client
  socket.send(JSON.stringify({ type: "id", id }));

  socket.send(JSON.stringify({
      type: "map",
      data: mapData
  }));

  console.log("Sending map data to", id, " with map data ", mapData);

  socket.on("message", (msg) => {
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
        const chatPacket = JSON.stringify({ type: "chat", from: id, message: data.sender + ": " + data.message }); 
        wss.clients.forEach(c => c.send(chatPacket)); 
      }
    } catch {}
  });

  socket.on("close", () => {
    delete players[id];
  });
});

server.listen(PORT, () => {
  console.log("Listening on port", PORT);
});
