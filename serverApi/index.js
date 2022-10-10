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

  ws.send(JSON.stringify({
    type: 'CONNECTED',
    array: arrayCanvas
  }));

  ws.on('close', () => {
    console.log('Client disconnected! id=', id);
    delete activeConnections[id];
  });

  ws.on('message', array => {
    const decodedData = JSON.parse(array);

    switch (decodedData.type) {
      case 'CREATE_CANVAS':
        arrayCanvas.push(...decodedData.array);

        Object.keys(activeConnections).forEach(connectId => {
          const user = activeConnections[connectId];

          user.send(JSON.stringify({
            type: 'NEW_DATA_CANVAS',
            array: arrayCanvas
          }));
        });
        break;
      default:
        console.log('Unknown data type:', decodedData.type);
    }
  });
});

app.listen(port, () => {
  console.log('Server started on ' + port + ' port!');
});