import Task from "../models/tasks.model";
import { BaseTask } from "../interfaces/task.interface";

export const findByTaskId = (taskId: string) => Task.find({ taskId });

export const findByListId = (listId: string) => Task.find({ listId });

export const findByParentId = (parentId: string) => Task.find({ parentId });

export const createTask = (task: BaseTask) => new Task(task).save();

export const deleteTask = (taskId: string) => Task.deleteOne({ taskId });

export const addSubtask = (taskId: string, subtaskId: string) => Task.findOneAndUpdate({
  taskId
}, { $push: { tasks: subtaskId } }, { upsert: true });

export const deleteSubtaskId = (taskId: string, subtaskId: string) => Task.findOneAndUpdate({
  taskId
}, { $pull: { tasks: subtaskId } });

export const updateTask = (task: BaseTask) => Task.findOneAndUpdate({
  taskId: task.taskId
}, { $set:
    {
      title: task.title,
      done: task.done,
      cost: task.cost,
      type: task.type,
      deadline: task.deadline,
      carbs: task.carbs,
      fat: task.fat,
      protein: task.protein,
      img: task.img,
    }
}, { upsert: true });

export const deleteByListId = (listId: string) => Task.deleteMany({ listId });
