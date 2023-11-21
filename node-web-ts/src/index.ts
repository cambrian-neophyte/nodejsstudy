import express, { Express, Request, Response } from "express";
import { setupMessaging, sendMessage, getMessages } from "./messaging.js";
const app: Express = express();
const port = process.env.PORT;

setupMessaging();

app.use(express.urlencoded());
console.log(process.env.PORT);
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
app.get("/log", (req,res)=> {
  let msgList =  getMessages();
  res.render("log", { messages: msgList });
});
app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}.`);
});
