import { Task } from "./definitions";
import { SORT_DIRECTION, TASK_STATUS } from "./enums";
import tasksDb from "./fakeDb.json";

export type SortConfig = {
  column: string;
  direction: SORT_DIRECTION;
} | null;

export type PaginationConfig = {
  page: number;
  pageSize: number;
};

export type FilterValue = any;

export type FilterConfig = {
  [key: string]: FilterValue | FilterValue[];
};

const filterTask = (task: Task, filters: FilterConfig): boolean => {
  const output = Object.entries(filters).every(([key, value]) => {
    if (value === null || value === undefined) return true;

    const taskValue = task[key as keyof Task];
    if (taskValue === undefined) return true;

    if (Array.isArray(value)) {
      return value.length === 0 || value.some((v) => v === taskValue);
    }

    // string search with regex
    if (
      typeof taskValue === "string" &&
      typeof value === "string" &&
      value.trim()
    ) {
      try {
        const regex = new RegExp(value, "gi");
        return regex.test(taskValue);
      } catch (e) {
        return taskValue.toLowerCase().includes(value.toLowerCase());
      }
    }

    // basic comparison
    return taskValue === value;
  });

  return output;
};

export const fetchMockTasks = (
  sortConfig?: SortConfig,
  pagination?: PaginationConfig,
  filters?: FilterConfig
): Promise<{ tasks: Task[]; totalCount: number }> => {
  return new Promise((resolve) => {
    let tasks: Task[] = [...tasksDb] as any;

    // Apply filters
    if (filters) tasks = tasks.filter((task) => filterTask(task, filters));

    const totalCount = tasks.length;

    // Apply sorting
    if (
      tasks.length > 0 &&
      sortConfig &&
      Object.keys(tasks[0]).includes(sortConfig.column)
    ) {
      const { column, direction } = sortConfig;
      tasks = tasks.sort((a, b) => {
        let comparison = 0;

        if (column === "dueDate" || column === "createdAt") {
          comparison =
            new Date(a[column]).getTime() - new Date(b[column]).getTime();
        } else if (column === "priority") {
          const priorityOrder = { Low: 1, Medium: 2, High: 3 };
          comparison =
            priorityOrder[a.priority as keyof typeof priorityOrder] -
            priorityOrder[b.priority as keyof typeof priorityOrder];
        } else {
          // String comparison for other fields
          comparison = String(a[column as keyof Task]).localeCompare(
            String(b[column as keyof Task])
          );
        }

        return direction === SORT_DIRECTION.ASC ? comparison : -comparison;
      });
    }

    // Apply pagination
    if (tasks.length > 0 && pagination) {
      const { page, pageSize } = pagination;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      tasks = tasks.slice(startIndex, endIndex);
    }

    setTimeout(() => {
      resolve({ tasks, totalCount });
    }, 1500); // Simulate network delay
  });
};

export function fetchMockTaskCounts(): Promise<{
  open: number;
  closed: number;
  inProgress: number;
}> {
  return new Promise((resolve) => {
    const open = tasksDb.filter(
      (task) => task.status === TASK_STATUS.OPEN
    ).length;
    const inProgress = tasksDb.filter(
      (task) => task.status === TASK_STATUS.IN_PROGRESS
    ).length;
    const closed = tasksDb.filter(
      (task) => task.status === TASK_STATUS.CLOSED
    ).length;

    setTimeout(() => {
      resolve({ open, closed, inProgress });
    }, 1000);
  });
}
