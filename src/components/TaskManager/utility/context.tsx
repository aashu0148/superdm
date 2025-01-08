import {
  createContext,
  useContext,
  useState,
  Dispatch,
  SetStateAction,
} from "react";
import { SORT_DIRECTION, TASK_STATUS } from "@utils/enums";
import { Task } from "@/utils/definitions";
import { useSearchParams } from "react-router-dom";

interface TaskCounts {
  [TASK_STATUS.OPEN]: number;
  [TASK_STATUS.IN_PROGRESS]: number;
  [TASK_STATUS.CLOSED]: number;
  total: number;
}

interface Pagination {
  page: number;
  pageSize: number;
}
interface Loading {
  initial: boolean;
  more: boolean;
}

interface ContextValue {
  tasks: Task[];
  selectedTask: Task | null;
  selectedTaskIndex: number;
  loading: Loading;
  counts: TaskCounts;
  totalCount: number;
  pagination: Pagination;
  infiniteScroll: boolean;

  setInfiniteScroll: Dispatch<SetStateAction<boolean>>;
  setTasks: Dispatch<SetStateAction<Task[]>>;
  setSelectedTask: Dispatch<SetStateAction<Task | null>>;
  setSelectedTaskIndex: Dispatch<SetStateAction<number>>;
  setLoading: Dispatch<SetStateAction<Loading>>;
  setCounts: Dispatch<SetStateAction<TaskCounts>>;
  setTotalCount: Dispatch<SetStateAction<number>>;
  setPagination: Dispatch<SetStateAction<Pagination>>;

  selectedTab: string;
  sortingColumn: string;
  sortingOrder: SORT_DIRECTION;
  columnToSearch: string;
  queryToSearch: string;
}

const TaskManagerContext = createContext<ContextValue>({} as ContextValue);

export const TaskManagerProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [infiniteScroll, setInfiniteScroll] = useState(true);
  const [searchParams] = useSearchParams();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedTaskIndex, setSelectedTaskIndex] = useState<number>(0);
  const [loading, setLoading] = useState({ initial: true, more: false });
  const [counts, setCounts] = useState<TaskCounts>({
    [TASK_STATUS.OPEN]: 0,
    [TASK_STATUS.IN_PROGRESS]: 0,
    [TASK_STATUS.CLOSED]: 0,
    total: 0,
  });
  const [totalCount, setTotalCount] = useState(0);
  const [pagination, setPagination] = useState({
    page: Number(searchParams.get("page")) || 1,
    pageSize: Number(searchParams.get("pageSize")) || 20,
  });

  // Get values from URL params with defaults
  const selectedTab = searchParams.get("tab") || TASK_STATUS.OPEN;
  const sortingColumn = searchParams.get("sort-column") || "";
  const sortingOrder = searchParams.get("sort-order") as SORT_DIRECTION;
  const columnToSearch = searchParams.get("column") || "";
  const queryToSearch = searchParams.get("query") || "";

  const value = {
    tasks,
    setTasks,
    selectedTask,
    setSelectedTask,
    selectedTaskIndex,
    setSelectedTaskIndex,
    loading,
    setLoading,
    counts,
    setCounts,
    totalCount,
    setTotalCount,
    pagination,
    setPagination,
    infiniteScroll,
    setInfiniteScroll,
    selectedTab,
    sortingColumn,
    sortingOrder,
    columnToSearch,
    queryToSearch,
  };

  return (
    <TaskManagerContext.Provider value={value}>
      {children}
    </TaskManagerContext.Provider>
  );
};

export const useTaskManager = () => {
  const context = useContext(TaskManagerContext);

  if (!context) {
    throw new Error("useTaskManager must be used within a TaskManagerProvider");
  }
  return context;
};
