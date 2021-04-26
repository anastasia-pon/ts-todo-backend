import { Document, model, Schema } from "mongoose";

export const TaskSchema = new Schema<TaskDocument>({
	taskId: {
    type: String,
    required: true,
  },
  parentId: {
    type: String,
    equired: true,
  },
  listId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  done: {
    type: Boolean,
    required: true,
  },
  order: {
    type: Number,
  },
  cost: {
    type: String,
  },
	type: {
    type: String,
    required: true,
  },
	deadline: {
    type: String,
  },
	carbs: {
    type: String,
  },
	fat: {
    type: String,
  },
  protein: {
    type: String,
  },
  img: {
    type: String,
  },
  tasks: [String],
});

export interface TaskDocument extends Document {
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

export default model<TaskDocument>('tasks', TaskSchema);