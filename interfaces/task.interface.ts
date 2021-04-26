export interface BaseTask {
  taskId: string;
  parentId: string;
  listId: string;
  title: string;
  done: boolean;
  order?: number;
  cost?: string;
  type: string;
  deadline?: string;
  carbs?: string;
  fat?: string;
  protein?: string;
  img?: string;
  tasks: string[];
};
