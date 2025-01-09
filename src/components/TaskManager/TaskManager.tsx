import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import { Tabs, TabsList, TabsTrigger } from "@components/ui/tabs";
import DataTable from "@components//DataTable/DataTable";
import TaskDetailsDialog from "./TaskDetailsDialog";
import { Button } from "@components/ui/button";
import ColumnSearch from "./ColumnSearch";

import { SORT_DIRECTION } from "@/utils/enums";
import { statusOptions } from "./utility/util";
import { getDateFormatted } from "@/utils/utility";
import { useTaskManager } from "./utility/context";
import useFetchTasks from "./utility/useFetchTasks";

const TaskManagerMain = () => {
  const [_searchParams, setSearchParams] = useSearchParams();
  const {
    tasks,
    selectedTask,
    selectedTaskIndex,
    loading,
    counts,
    totalCount,
    pagination,
    infiniteScroll,

    setInfiniteScroll,
    setSelectedTask,
    setSelectedTaskIndex,
    setPagination,

    selectedTab,
    sortingColumn,
    sortingOrder,
    columnToSearch,
    queryToSearch,
  } = useTaskManager();
  const { fetchCounts, fetchTasks, handleNearEnd } = useFetchTasks();

  const updateTab = (newTab: string) => {
    setSearchParams((prev) => {
      prev.set("tab", newTab);
      return prev;
    });
    handlePaginationChange({ ...pagination, page: 1 });
  };

  const updateSorting = (column: string, order: SORT_DIRECTION) => {
    setSearchParams((prev) => {
      if (column) {
        prev.set("sort-column", column);
        prev.set("sort-order", order);
      } else {
        prev.delete("sort-column");
        prev.delete("sort-order");
      }
      return prev;
    });
  };

  const handlePaginationChange = (newPagination: {
    page: number;
    pageSize: number;
  }) => {
    setPagination(newPagination);

    if (!infiniteScroll)
      setSearchParams((prev) => {
        prev.set("page", newPagination.page.toString());
        prev.set("pageSize", newPagination.pageSize.toString());
        return prev;
      });
  };

  function handleColumnSearch(col: string, query: string) {
    setSearchParams((prev) => {
      if (query) {
        prev.set("column", col);
        prev.set("query", query);
      } else {
        prev.delete("column");
        prev.delete("query");
      }

      handlePaginationChange({ ...pagination, page: 1 });
      return prev;
    });
  }

  function handleInfiniteScrollToggle() {
    setInfiniteScroll((p) => !p);
    fetchTasks();
  }

  function handleRowClick(id: string) {
    const idx = tasks.findIndex((t) => t.id === id)!;
    if (idx === -1) return;

    setSelectedTaskIndex(idx);
    setSelectedTask(tasks[idx]);
  }

  function focusOnRow(idx: number, delay: boolean = false) {
    const selector = `table tr[data-index="${idx}"]`;
    if (delay) {
      setTimeout(() => {
        (document.querySelector(selector) as any)?.focus();
      }, 100);
      return;
    }
    (document.querySelector(selector) as any)?.focus();
  }

  // Keyboard navigation handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedTask) {
        // Table keyboard controls
        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
          e.preventDefault();
          const direction = e.key === "ArrowUp" ? -1 : 1;
          const newIndex = selectedTaskIndex + direction;
          if (newIndex >= 0 && newIndex < tasks.length) {
            setSelectedTaskIndex(newIndex);
            focusOnRow(newIndex);
          }
        } else if (e.key === "Enter" && selectedTaskIndex >= 0) {
          const focusInsideTable = document
            .querySelector("table")
            ?.contains(document.activeElement);

          if (focusInsideTable) setSelectedTask(tasks[selectedTaskIndex]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedTask, selectedTaskIndex, tasks]);

  useEffect(() => {
    if (infiniteScroll) return;

    fetchTasks();
  }, [pagination]);

  useEffect(() => {
    fetchTasks();
  }, [sortingColumn, sortingOrder, selectedTab, columnToSearch, queryToSearch]);

  useEffect(() => {
    fetchCounts();
  }, []);

  const columns = useMemo(
    () => [
      { accessorKey: "priority", header: "Priority" },
      { accessorKey: "id", header: "ID", allowSort: false },
      { accessorKey: "status", header: "Status", allowSort: false },
      { accessorKey: "labels", header: "Labels" },
      { accessorKey: "name", header: "Name" },
      { accessorKey: "dueDate", header: "Due Date" },
      { accessorKey: "createdAt", header: "Created At" },
      { accessorKey: "assignee", header: "Assignee" },
    ],
    []
  );
  const tableData = useMemo(
    () =>
      tasks.map((task) => ({
        ...task,
        dueDate: getDateFormatted(task.dueDate, true),
        createdAt: getDateFormatted(task.createdAt, true),
        labels: task.labels.join(", "),
      })),
    [tasks]
  );

  return (
    <div className="p-4 flex-col flex gap-2">
      <div className="flex justify-end items-center">
        <Button variant={"outline"} onClick={handleInfiniteScrollToggle}>
          Use {infiniteScroll ? "Pagination" : "Infinite Scroll"}
        </Button>
      </div>

      <div className="flex gap-4 z-[80] relative justify-between items-center flex-wrap md:flex-nowrap">
        <Tabs value={selectedTab} onValueChange={updateTab}>
          <TabsList>
            {statusOptions.map((item) => (
              <TabsTrigger key={item.value} value={item.value}>
                {item.label} (
                {selectedTab === item.value
                  ? loading.initial
                    ? "..."
                    : totalCount
                  : counts[item.value]}
                )
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <ColumnSearch
          onSearch={(column, query) => handleColumnSearch(column, query)}
        />
      </div>

      <DataTable
        loading={loading.initial}
        loadingMore={loading.more}
        columns={columns}
        data={tableData}
        defaultSort={[{ id: "createdAt", desc: true }]}
        onRowClick={({ id }) => handleRowClick(id)}
        onEndReached={() => handleNearEnd(true)}
        onNearEnd={() => handleNearEnd()}
        className="mt-4"
        manualPagination={!infiniteScroll}
        pageSize={pagination.pageSize}
        currentPage={pagination.page}
        totalRows={totalCount}
        onPageChange={handlePaginationChange}
        onSortingChange={(sorting) => {
          if (sorting.length > 0) {
            const column = sorting[0].id;
            const order = sorting[0].desc
              ? SORT_DIRECTION.DESC
              : SORT_DIRECTION.ASC;
            updateSorting(column, order);
          } else {
            // Reset sorting
            updateSorting("", SORT_DIRECTION.ASC);
          }
        }}
      />

      <TaskDetailsDialog
        open={!!selectedTask}
        onOpenChange={() => {
          setSelectedTask(null);
          focusOnRow(selectedTaskIndex, true);
        }}
      />
    </div>
  );
};

export default TaskManagerMain;
