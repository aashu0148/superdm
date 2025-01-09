import { fetchMockTaskCounts, fetchMockTasks } from "@/utils/fakeApi";
import { useTaskManager } from "./context";
import { TASK_STATUS } from "@/utils/enums";

export default function useFetchTasks() {
  const {
    tasks,
    loading,
    totalCount,
    pagination,
    infiniteScroll,

    setLoading,
    setCounts,
    setTotalCount,
    setTasks,
    setPagination,

    selectedTab,
    sortingColumn,
    sortingOrder,
    columnToSearch,
    queryToSearch,
  } = useTaskManager();

  async function handleNearEnd(scrollUp = false) {
    if (loading.initial || loading.more || totalCount <= tasks.length) return;

    // go to next page
    let newPage = pagination.page + 1;
    if (pagination.page * pagination.pageSize > totalCount) {
      // incorrect page number, reset it
      newPage = 1;
      setTasks([]);
    }

    setPagination({ page: newPage, pageSize: pagination.pageSize });

    setLoading((p) => ({ ...p, more: true }));
    const { tasks: fetchedTasks } = await fetchMockTasks(
      {
        column: sortingColumn,
        direction: sortingOrder,
      },
      { ...pagination, page: newPage },
      {
        [columnToSearch]: queryToSearch,
        status: selectedTab,
      }
    );

    if (scrollUp) window.scrollBy({ top: -20, behavior: "smooth" });

    setLoading((p) => ({ ...p, more: false }));
    setTasks((prev) => [...prev, ...fetchedTasks]);
  }

  const fetchTasks = async () => {
    let newPage = pagination.page;

    if (infiniteScroll && newPage !== 1) {
      newPage = 1;
      setPagination({ page: newPage, pageSize: pagination.pageSize });
    }

    setLoading((p) => ({ ...p, initial: true }));
    const { tasks: fetchedTasks, totalCount: total } = await fetchMockTasks(
      {
        column: sortingColumn,
        direction: sortingOrder,
      },
      { ...pagination, page: newPage },
      {
        [columnToSearch]: queryToSearch,
        status: selectedTab,
      }
    );
    setLoading((p) => ({ ...p, initial: false }));
    setTasks(fetchedTasks);
    setTotalCount(total);
  };

  async function fetchCounts() {
    const { open, closed, inProgress } = await fetchMockTaskCounts();

    setCounts({
      [TASK_STATUS.OPEN]: open,
      [TASK_STATUS.IN_PROGRESS]: inProgress,
      [TASK_STATUS.CLOSED]: closed,
      total: open + closed + inProgress,
    });
  }

  return { fetchCounts, fetchTasks, handleNearEnd };
}
