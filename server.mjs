import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import Fullmetal from 'fullmetal-client';
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
const fullmetal = new Fullmetal('credential-key');
fullmetal.onResponse(async (result) => {
  io.to(result.refId).emit('response', result.response);
});
io.on('connection', async (socket) => {
  console.log('New connection established', socket.id);
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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}/completions`);
});

io.listen(5025, () => {
  console.log(`Client backend server is running on port 5020`);
});
