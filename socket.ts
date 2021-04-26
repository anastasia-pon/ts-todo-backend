import { Server } from "socket.io";
import * as SocketService from "./services/socket.service";
import { BaseTask } from "./interfaces/task.interface";

export default (io: Server) => {

  io.on('connection', (socket) => {

    socket.on('join', (roomId: string) => {
      socket.join(roomId);
      SocketService.createNewParticipant(socket, io, roomId);
      SocketService.sendList(io, roomId, socket.id);
    });

    socket.on('task:add', (newTask: BaseTask) => {
      SocketService.addTask(io, newTask, socket.id);
    });

    socket.on('task:update', (updatedTask: BaseTask) => {
      SocketService.updateTask(io, updatedTask, socket.id);
    });

    socket.on('task:delete', (taskId: string, parentId: string, listId: string) => {
      SocketService.deleteTask(io, taskId, parentId, listId, socket.id);
    });

    socket.on('disconnect', () => {
      SocketService.removeParticipant(io, socket.id);
    });
  });
};
