function appendLogMessage(msg) {
  let container = document.getElementById("logcontainer");
  let logItem = document.createElement("div");
  let headline = document.createElement("h3");
  let text = document.createElement("p");
  headline.textContent =
    "Message #" + msg.offset + " from " + new Date(msg.timestamp).toISOString();
  text.textContent = msg.text;
  logItem.classList.add("logitem");

  logItem.appendChild(headline);
  logItem.appendChild(text);
  container.appendChild(logItem);
}

function setConnectedViewState(connected) {
  // get element, set class, bla bla
  let view = document.getElementsByClassName("connected")[0];
  if (connected) {
    view.textContent = "✔️connected";
  } else {
    view.textContent = "❌disconnected";
  }
}

function getWsURL() {
  let location = window.location;
  // TODO https
  let result = "ws://" + location.host + location.pathname + "/ws";
  return result;
}

function connectWebsocket() {
  let ws = new WebSocket(getWsURL());
  ws.addEventListener("open", (event) => {
    setConnectedViewState(true);
  });
  ws.addEventListener("message", (event) => {
    console.log("received message!!!!");
    appendLogMessage(JSON.parse(event.data));
  });

  ws.addEventListener("close", (event) => {
    setConnectedViewState(false);
    // todo add backoff
    setTimeout(connectWebsocket, 3000);
  });
}

connectWebsocket();