const express = require("express");
const { AccessToken } = require("livekit-server-sdk");
const { v4 } = require("uuid");
const app = express();
const cors = require('cors');
const port = 5000;

app.use(express.json())
app.use(cors())

app.post("/", (req, res) => {
  const { roomName, participantName } = req.body;
  const at = new AccessToken('APIuBCULwfwqNRH', 'Tx30wWduSWb9HvhOycJsNSHBvjlk6Vezf0yNn2jPpuR', {
    identity: participantName,
  });
  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
  });

  const token = at.toJwt();
  res.send(token);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
