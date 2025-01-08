import { TASK_STATUS } from "@/utils/enums";

export interface TaskComment {
  taskId: string;
  comment: string;
}

export const statusOptions: { label: string; value: TASK_STATUS }[] = [
  {
    label: "Open",
    value: TASK_STATUS.OPEN,
  },
  {
    label: "In Progress",
    value: TASK_STATUS.IN_PROGRESS,
  },
  {
    label: "Closed",
    value: TASK_STATUS.CLOSED,
  },
];
