import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import https from 'https';
import fs from 'fs';

import { Server } from 'socket.io';
dotenv.config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: '*', // Change this to your React.js app's URL
    methods: ['GET', 'POST'],
  })
);
const options = {
  key: fs.readFileSync(`${process.env.key}`),
  cert: fs.readFileSync(`${process.env.cert}`),
  ca: fs.readFileSync(`${process.env.ca}`),

  requestCert: false,
  rejectUnauthorized: false,
};
const PORT = process.env.PORT || 8000;

const httpsServer = https.createServer(options, app);

import Fullmetal from 'fullmetal-client';
import axios from 'axios';

const io = new Server(httpsServer, {
  cors: {
    origin: '*', // Change this to your React.js app's URL
    methods: ['GET', 'POST'],
  },
});
const fullMetalConfig = {
  apiKey: process.env.FULLMETAL_API_KEY,
  name: 'FullmetalChat',
};
const fullmetal = new Fullmetal(fullMetalConfig);
fullmetal.onResponse(async (response) => {
  // response= {token:'', completed:false, speed:10/s, elapsedTime:2s model:''Wizard-Vicuna-7B-Uncensored', refId: end-client-socket.id}
  io.to(response.refId).emit('response', response);
});
fullmetal.onError(async (data) => {
  io.to(data.refId).emit('error', data.message);
});

fullmetal.onResponseQueue(async (data) => {
  io.to(data.refId).emit('responseQueuedNumber', data.queuedNumber);
});
io.on('connection', async (socket) => {
  console.log('New connection established', socket.id);

  socket.on('prompt', async (data) => {
    const npcData = data.npc ? JSON.parse(data.npc) : null;
    const tprompt = `${
      npcData
        ? `Remember you are ${npcData.name}, role is ${npcData.role}. ${npcData.summary}
      `
        : ``
    } ${data.prompt}`;
    await fullmetal.sendPrompt(tprompt, socket.id, { model: data.model });
  });
});

const handleModelRequest = async (req, res) => {
  try {
    const response = await axios.get(
      `${process.env.FULLMETAL_API_URL}/models`,
      {
        headers: {
          apiKey: process.env.FULLMETAL_API_KEY,
        },
      }
    );

    res.status(200).json({ data: response.data });
  } catch (error) {
    console.error('Error fetching models:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
app.get('/models', handleModelRequest);

io.on('error', (error) => {
  console.error('Socket.IO Error:', error);
});

httpsServer.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
