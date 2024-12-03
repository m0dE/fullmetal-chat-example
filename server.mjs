import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Fullmetal from 'fullmetal-client';
import axios from 'axios';
dotenv.config();

const PORT = 8000;
const app = express();

app.use(express.json());
app.use(cors());

import http from 'http';
import { Server } from 'socket.io';
const backEndServer = http.createServer(app);
const io = new Server(backEndServer, {
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

    console.log(response);
    res.status(200).json({ data: response.data });
  } catch (error) {
    console.error('Error fetching models:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

app.get('/models', handleModelRequest);
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}/completions`);
});

io.listen(5025, () => {
  console.log(`Client backend server is running on port 5025`);
});
