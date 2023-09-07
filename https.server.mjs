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
const PORT = process.env.PORT || 8081;

const httpsServer = https.createServer(options, app);

import Fullmetal from 'fullmetal-client';

const io = new Server(httpsServer, {
  cors: {
    origin: '*', // Change this to your React.js app's URL
    methods: ['GET', 'POST'],
  },
});
const fullMetalConfig = {
  apiKey: process.env.FULLMETAL_API_KEY,
};
const fullmetal = new Fullmetal(fullMetalConfig);
fullmetal.onResponse(async (response) => {
  // response= {token:'', completed:false, speed:10, model:''Wizard-Vicuna-7B-Uncensored', refId: end-client-socket.id}
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
    await fullmetal.sendPrompt(
      `This is a conversation between a user and a helpful assistant.
USER: ${data.prompt}  
ASSISTANT:`,
      socket.id,
      { model: data.model }
    );
  });
});

io.on('error', (error) => {
  console.error('Socket.IO Error:', error);
});

httpsServer.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
