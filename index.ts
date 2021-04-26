/**
 * Required External Modules
 */
import * as dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import http from 'http';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { Server } from "socket.io";
import initializeSocketIO from "./socket";

import connectDB from './db/connect.db'
import { usersRouter } from './routes/users.router';
import { todosRouter } from './routes/todos.router';
import { errorHandler } from './middleware/error.middleware';
import { notFoundHandler } from './middleware/not-found.middleware';

dotenv.config();

/**
 * App Variables
 */

 if (!process.env.PORT) {
  process.exit(1);
}

const PORT: number = parseInt(process.env.PORT as string, 10);

const app = express();

/**
 *  App Configuration
 */

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/users', usersRouter);
app.use('/api/todos', todosRouter);
app.get('/', (req, res) => res.send('Hello world!'));

app.use(errorHandler);
app.use(notFoundHandler);

/**
 * Server Activation
 */

const  server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000'],
    credentials: true
  }
});

initializeSocketIO(io);

connectDB().then(async () => {
  server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });
});

// Gracefully close connection to MongoDB when turning off the server.
process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log('MongoDB: Connection closed.');
    process.exit(0);
  });
});
