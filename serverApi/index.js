const express = require('express');
const cors = require('cors');
const {nanoid} = require('nanoid');

const app = express();

require('express-ws')(app);
const port = 8000;

app.use(cors());

const activeConnections = {};
const arrayCanvas = [];

app.ws('/canvas', (ws) => {
  const id = nanoid();

  console.log('Client connected id=', id);
  activeConnections[id] = ws;

  ws.on('close', () => {
    console.log('Client disconnected! id=', id);
    delete activeConnections[id];
  });

  ws.on('message', array => {
    arrayCanvas.push(...JSON.parse(array));
    console.log(arrayCanvas);
  });
});

app.listen(port, () => {
  console.log('Server started on ' + port + ' port!');
});