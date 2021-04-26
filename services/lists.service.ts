import List from "../models/lists.model";
import { BaseList } from "../interfaces/list.interface";

export const findByUserId = (userId: string) => List.find({ userId });

export const findByListId = (listId: string) => List.find({ listId });

export const createList = (list: BaseList) => new List(list).save();

export const addTask = (listId: string, taskId: string) => List.findOneAndUpdate({
  listId
}, { $push: { tasks: taskId } }, { upsert: true });

export const deleteTaskId = (listId: string, subtaskId: string) => List.findOneAndUpdate({
  listId
}, { $pull: { tasks: subtaskId } });

export const deleteList = (listId: string) => List.deleteOne({ listId });
