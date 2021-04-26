import express, { Request, Response } from 'express';
import * as ListService from "../services/lists.service";
import * as TaskService from "../services/tasks.service";
import { BaseList } from "../interfaces/list.interface";
import { ListDocument } from '../models/lists.model';
import { TaskDocument } from '../models/tasks.model';
import { authenticationRequired } from '../authentication/authentication';

export const todosRouter = express.Router();

todosRouter.post('/get/all', authenticationRequired, async (req: Request, res: Response) => {
  const { userId } = req.body;

  try {
    const list: ListDocument[] = await ListService.findByUserId(userId);
    return res.status(201).json(list);
  } catch (err) {
    res.status(400).json(err.message);
  }
});

todosRouter.post('/get/one', async (req: Request, res: Response) => {
  const { listId } = req.body;

  try {
    const list: ListDocument[] = await ListService.findByListId(listId);
    const tasks: TaskDocument[] = await TaskService.findByListId(listId);
    return res.status(201).json({list: list[0], tasks});
  } catch (err) {
    res.status(400).json(err.message);
  }
});

todosRouter.post('/create', authenticationRequired, async (req: Request, res: Response) => {
  const { title, desc, userId, listId } = req.body.list;

  if (!title || !desc || !userId || !listId) {
    const err = new Error('Missing list information');
    return res.status(500).json(err.message);
  }
  const listMatch: ListDocument[] = await ListService.findByListId(listId);
  if (listMatch.length > 0) {
    const err = new Error('List with this id already exists!');
    return res.status(400).json(err.message);
  }
  try {
    const newList: BaseList = {
      title,
      desc,
      listId,
      userId,
      coEditing: true,
      tasks: []
    };
    const dbList = await ListService.createList(newList);
    return res.status(201).json(dbList);
  } catch (err) {
    console.log(err);
    res.status(400).json(err.message);
  }
});

todosRouter.post('/delete', authenticationRequired, async (req: Request, res: Response) => {
  const { listId } = req.body;

  if (!listId) {
    const err = new Error('Missing list information');
    return res.status(500).json(err.message);
  }
  const listMatch: ListDocument[] = await ListService.findByListId(listId);
  if (listMatch.length === 0) {
    const err = new Error('List does not exist');
    return res.status(400).json(err.message);
  }
  try {
    const dbList = await ListService.deleteList(listId);
    await TaskService.deleteByListId(listId);
    return res.status(201).json(dbList);
  } catch (err) {
    console.log(err);
    res.status(400).json(err.message);
  }
});

