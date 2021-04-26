import { BaseTask } from './task.interface';

export interface BaseList {
  title: string;
  desc: string;
  listId: string;
  userId: string;
  coEditing: boolean;
  tasks: BaseTask[];
};
