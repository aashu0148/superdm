import { TASK_STATUS } from "./enums";

export interface Task {
  id: string;
  priority: string;
  status: TASK_STATUS;
  labels: string[];
  name: string;
  dueDate: string;
  createdAt: string;
  assignee: string;
  comment?: string;
}
