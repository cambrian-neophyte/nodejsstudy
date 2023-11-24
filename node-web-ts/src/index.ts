import express, { Express, Request, Response } from "express";
import {
  setupMessaging,
  Message,
  sendMessage,
  getMessages,
  subscribe,
  unsubscribe,
  Listener,
} from "./messaging.js";
import { WebSocketServer, WebSocket } from "ws";

const port = process.env.PORT;

setupMessaging();

const app: Express = express();
app.use(express.urlencoded());
app.use(express.static("public"));
app.set("view engine", "pug");

app.get("/", (req, res) => {
  res.render("index");
});
app.post("/message", async (req, res) => {
  let success = true;
  try {
    await sendMessage(req.body.msg);
  } catch (e: any) {
    console.log(e);
    success = false;
  }
  res.render("message", {
    success: success,
  });
});
app.get("/log", (req, res) => {
  let msgList = getMessages();
  res.render("log", { messages: msgList });
});
app.post("/kill", (req, resp) => {
  // TODO close websocket connections, kafka connections, stop http server
  process.exit();
});

// The http server will be shared between express and the websocket code
let server = app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}.`);
});

// WebSocket connections
const wsServer = new WebSocketServer({ noServer: true });

// Websocket connections are built by sending an upgrade request to a http server.
// connection attempts are accepted for the /log/ws resource.
server.on("upgrade", function connection(req, socket, head) {
  //console.log(req.url!!)
  //const { pathname } = new URL(req.url!!);
  // for some reason, url is just the path
  if (req.url! === "/log/ws") {
    wsServer.handleUpgrade(req, socket, head, function (ws) {
      wsServer.emit("connection", ws);
    });
  } else {
    // do not accept upgrade attempts for other paths
    socket.destroy();
  }
});
console.error("Websocket: " + WebSocket.OPEN);
// Kafka message subscriber will push received messages to all connected clients.
subscribe((msg: Message) => {
  console.log("Listener received message.");
  wsServer.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(msg), { binary: false });
    }
  });
});
