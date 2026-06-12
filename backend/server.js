import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });
const rooms = {}; // roomCode -> { managers: [wsClients], status: 'lobby'|'drafting', picks: [] }

console.log("WebSocket Draft Room Server running on port 8080...");

wss.on("connection", (ws) => {
  let userRoomCode = null;
  let userManagerName = null;

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      const { type, roomCode, managerName, player, round, managerIndex } = data;

      if (type === "join") {
        userRoomCode = roomCode;
        userManagerName = managerName;

        if (!rooms[roomCode]) {
          rooms[roomCode] = {
            managers: [],
            status: "lobby",
            picks: []
          };
        }

        rooms[roomCode].managers.push({ ws, name: managerName });
        console.log(`@${managerName} joined room [${roomCode}]`);

        // Broadcast updated managers list to room
        broadcastToRoom(roomCode, {
          type: "lobby_update",
          managers: rooms[roomCode].managers.map(m => m.name)
        });
      }

      if (type === "start") {
        if (rooms[roomCode]) {
          rooms[roomCode].status = "drafting";
          broadcastToRoom(roomCode, { type: "draft_start" });
        }
      }

      if (type === "pick") {
        if (rooms[roomCode]) {
          rooms[roomCode].picks.push({ round, managerIndex, player });
          broadcastToRoom(roomCode, {
            type: "pick_broadcast",
            round,
            managerIndex,
            player,
            managerName
          });
        }
      }
    } catch (err) {
      console.error("Failed to process message:", err);
    }
  });

  ws.on("close", () => {
    if (userRoomCode && rooms[userRoomCode]) {
      rooms[userRoomCode].managers = rooms[userRoomCode].managers.filter(m => m.name !== userManagerName);
      console.log(`@${userManagerName} disconnected from room [${userRoomCode}]`);
      
      broadcastToRoom(userRoomCode, {
        type: "lobby_update",
        managers: rooms[userRoomCode].managers.map(m => m.name),
        disconnect: userManagerName
      });
    }
  });
});

function broadcastToRoom(roomCode, data) {
  if (rooms[roomCode]) {
    const jsonStr = JSON.stringify(data);
    rooms[roomCode].managers.forEach(client => {
      client.ws.send(jsonStr);
    });
  }
}
