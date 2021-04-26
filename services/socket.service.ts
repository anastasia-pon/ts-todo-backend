import { Server, Socket } from "socket.io";
import { ListDocument } from '../models/lists.model';
import { TaskDocument } from '../models/tasks.model';

import { BaseTask } from "../interfaces/task.interface";
import { Room } from "../interfaces/socket.interface";

import * as ListService from "./lists.service";
import * as TaskService from "./tasks.service";

export const sendList = async (io: Server, listId:string, reciever: string) => {
  try {
    const listMatch: ListDocument[] = await ListService.findByListId(listId);
    if (listMatch.length === 0) {
      const err = new Error('This list does not exist.');
      return io.to(reciever).emit('error', err.message);
    }
    const list: ListDocument[] = await ListService.findByListId(listId);
    const tasks: TaskDocument[] = await TaskService.findByListId(listId);
    return io.to(reciever).emit('list:send', {list: list[0], tasks});
  } catch (err) {
    io.to(reciever).emit('error', err.message);
  }
}

export const addTask = async (io: Server, newTask:BaseTask, clientId: string) => {
  if (!newTask.title || !newTask.taskId || !newTask.listId || !newTask.parentId || newTask.done === undefined || !newTask.type) {
    const err = new Error('Missing task information.');
    return io.to(clientId).emit('error', err.message);
  }

  const listMatch: ListDocument[] = await ListService.findByListId(newTask.listId);
  if (listMatch.length === 0) {
    return io.to(clientId).emit('list:send', {list: {}, tasks: []});
  }

  const taskMatch: TaskDocument[] = await TaskService.findByTaskId(newTask.taskId);
  if (taskMatch.length > 0) {
    const err = new Error('Task already exists.');
    return io.to(clientId).emit('error', err.message);
  }

  try {
    const dbTask = await TaskService.createTask(newTask);
    if (newTask.listId === dbTask.parentId) {
      await ListService.addTask(dbTask.listId, dbTask.taskId);
    } else {
      await TaskService.addSubtask(dbTask.parentId, dbTask.taskId);
    }
    sendList(io, newTask.listId, newTask.listId);
  } catch (err) {
    io.to(clientId).emit('error', err.message);
  }
}

export const updateTask = async (io: Server, updatedTask:BaseTask, clientId: string) => {
  if (!updatedTask.title || !updatedTask.taskId || !updatedTask.listId || !updatedTask.parentId || updatedTask.done === undefined || !updatedTask.type) {
    const err = new Error('Missing task information.');
    return io.to(clientId).emit('error', err.message);
  }

  const listMatch: ListDocument[] = await ListService.findByListId(updatedTask.listId);
  if (listMatch.length === 0) {
    return io.to(clientId).emit('list:send', {list: {}, tasks: []});
  }

  const taskMatch: TaskDocument[] = await TaskService.findByTaskId(updatedTask.taskId);
  if (taskMatch.length === 0) {
    const err = new Error('Task does not exist.');
    return io.to(clientId).emit('error', err.message);
  }

  try {
    await TaskService.updateTask(updatedTask);
    sendList(io, updatedTask.listId, updatedTask.listId);
  } catch (err) {
    console.log(err);
    io.to(clientId).emit('error', err.message);
  }
}

export const deleteTask = async (io: Server, taskId: string, parentId: string, listId: string, clientId: string) => {
  if (!taskId || !listId || !parentId) {
    const err = new Error('Missing task information.');
    return io.to(clientId).emit('error', err.message);
  }

  const listMatch: ListDocument[] = await ListService.findByListId(listId);
  if (listMatch.length === 0) {
    return io.to(clientId).emit('list:send', {list: {}, tasks: []});
  }

  const taskMatch: TaskDocument[] = await TaskService.findByTaskId(taskId);
  if (taskMatch.length === 0) {
    const err = new Error('Task does not exist.');
    return io.to(clientId).emit('error', err.message);
  }

  const childTasks: (TaskDocument | undefined)[] = await TaskService.findByParentId(taskId);
  let childrenWithSubtasks: (TaskDocument | undefined)[] = childTasks.filter((c) => c!.tasks.length > 0);
  while (childrenWithSubtasks.length > 0) {
    const promises: Promise<TaskDocument | undefined>[] = childrenWithSubtasks.map(async c => {
      if (c!.tasks.length > 0) {
        const child = await TaskService.findByParentId(c!.taskId);
        return child[0];
      }
    })
    const subtasks = await Promise.all(promises);
    childrenWithSubtasks = subtasks.filter((c) => c!.tasks.length > 0);
    if (subtasks) {
      childTasks.push(...subtasks);
    };
  };

  try {
    await TaskService.deleteTask(taskId);
    if (listId === parentId) {
      await ListService.deleteTaskId(listId, taskId);
    } else {
      await TaskService.deleteSubtaskId(parentId, taskId);
    }
    const promises: Promise<any>[] = childTasks.map(async c => {
        const child = await TaskService.deleteTask(c!.taskId);
        return child;
    })
    await Promise.all(promises);
    sendList(io, listId, listId);
  } catch (err) {
    console.log(err);
    io.to(clientId).emit('error', err.message);
  }
}

const rooms: Room[] = [];

export const createNewParticipant = (socket: Socket, io: Server, roomId: string) => {
  const creatures = ['Unicorn', 'Dragon', 'Yeti', 'Phoenix', 'Werewolf', 'Centaur', 'Mermaid', 'Leprechaun', 'Fairy', 'Elf'];
  const colors = ['Blue', 'Red', 'Orange', 'Green', 'Pink', 'Maroon', 'Brown', 'Purple', 'Lime', 'Teal'];
  const randomCreature = Math.floor(Math.random()*creatures.length);
  const randomColor = Math.floor(Math.random()*colors.length);
  const name = colors[randomColor] + ' ' + creatures[randomCreature];

  if (rooms.filter((r) => r.id === roomId).length === 0) {
    rooms.push({
      id: roomId,
      users: [],
    })
  }
  const room = rooms.filter((r) => r.id === roomId);
  const roomIndex = rooms.indexOf(room[0]);
  rooms[roomIndex].users.push({
    id: socket.id,
    name,
  })
  io.in(roomId).emit('participants:all', rooms[roomIndex].users);
}

export const removeParticipant = (io: Server, guestId: string) => {
  rooms.forEach((r) => {
    const user = r.users.filter((u) => u.id === guestId);
    if (user.length > 0) {
      const userIndex = r.users.indexOf(user[0]);
      r.users.splice(userIndex, 1);
      io.in(r.id).emit('participants:all', r.users);
    };
  })
}
