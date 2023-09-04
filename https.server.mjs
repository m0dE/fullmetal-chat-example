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
  apiKey: 'sample-key',
};
const fullmetal = new Fullmetal(fullMetalConfig);

fullmetal.onResponse(async (result) => {
  io.to(result.refId).emit('response', result.response);
});
io.on('connection', async (socket) => {
  console.log('New connection established', socket.id);
  // Receive questions from clients and pass them to agents

  socket.on('prompt', async (prompt) => {
    console.log(prompt);
    await fullmetal.sendPrompt(
      `This is a conversation between a user and a helpful assistant.
USER: ${prompt}
ASSISTANT:`,
      socket.id
    );
  });
});

app.get('/get', (req, res) => {
  res.json({ t: 1 });
});

io.on('error', (error) => {
  console.error('Socket.IO Error:', error);
});

httpsServer.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
