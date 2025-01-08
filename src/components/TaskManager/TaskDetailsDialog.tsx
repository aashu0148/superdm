import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog";
import { Button } from "@components/ui/button";

import { Task } from "@utils/definitions";
import { TASK_STATUS } from "@/utils/enums";
import { getDateFormatted } from "@/utils/utility";

import { statusOptions } from "./utility/util";
import TaskStatusChangeDialog from "./TaskStatusChangeDialog";
import { useTaskManager } from "./utility/context";
import useFetchTasks from "./utility/useFetchTasks";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function TaskDetailsDialog({ open, onOpenChange }: Props) {
  const {
    tasks,
    selectedTask,
    selectedTaskIndex,
    setSelectedTaskIndex,
    setTasks,
    setSelectedTask,
  } = useTaskManager();
  const { fetchCounts, handleNearEnd } = useFetchTasks();

  const [changeModalOpen, setChangeModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<null | TASK_STATUS>(
    null
  );

  function handleUpdateTask(id: string, task: Task) {
    // with real apis, this would be a PUT request
    setSelectedTask(task);

    const existing = tasks.find((t) => t.id === id);
    if (!existing) return;

    if (existing.status !== task.status) {
      // add the task to new tab (in real DB)
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...task } : t))
      );
      fetchCounts(); // mimic fetching counts to DB, as we are not actually updating the source(fake DB) so this call will not have any effect
    } else
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...task } : t))
      );
  }

  function handleStatusClick(status: TASK_STATUS) {
    setSelectedStatus(status);
    setChangeModalOpen(true);
  }

  function handleTaskStatusChange(comment: string) {
    if (!selectedStatus || !selectedTask) return;

    const newTask: Task = { ...selectedTask, comment, status: selectedStatus };
    handleUpdateTask(newTask.id, newTask);
    setChangeModalOpen(false);
    setSelectedStatus(null);
  }

  useEffect(() => {
    const handleKeyUp = (e: KeyboardEvent) => {
      if (selectedTask) {
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
          const direction = e.key === "ArrowLeft" ? -1 : 1;
          const newIndex = selectedTaskIndex + direction;
          if (newIndex >= 0 && newIndex < tasks.length) {
            setSelectedTaskIndex(newIndex);
            setSelectedTask(tasks[newIndex]);
          }

          if (tasks.length - newIndex === 3) {
            handleNearEnd(); // about to reach, end so fetch more
          }
        } else if (["1", "2", "3"].includes(e.key)) {
          const statusMap: Record<string, TASK_STATUS> = {
            "1": TASK_STATUS.OPEN,
            "2": TASK_STATUS.IN_PROGRESS,
            "3": TASK_STATUS.CLOSED,
          };

          handleStatusClick(statusMap[e.key]);
        }
      }
    };

    window.addEventListener("keyup", handleKeyUp);
    return () => window.removeEventListener("keyup", handleKeyUp);
  }, [selectedTask, selectedTaskIndex, tasks.length]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Task Details</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium focus:outline-none" tabIndex={0}>
                  Status
                </h3>
                <div className="flex gap-2 mt-2">
                  {statusOptions.map((item) => (
                    <Button
                      tabIndex={-1}
                      key={item.value}
                      variant={
                        selectedTask.status === item.value
                          ? "default"
                          : "outline"
                      }
                      onClick={() => handleStatusClick(item.value)}
                    >
                      {item.label}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-medium">Details</h3>
                <div className="mt-2 space-y-2 [&_span]:min-w-[80px] [&_span]:inline-block [&_span]:text-gray-600">
                  <p>
                    <span>ID</span>: {selectedTask.id}
                  </p>
                  <p>
                    <span>Name</span>: {selectedTask.name}
                  </p>
                  <p>
                    <span>Priority</span>: {selectedTask.priority}
                  </p>
                  <p>
                    <span>Due Date</span>:{" "}
                    {getDateFormatted(selectedTask.dueDate)}
                  </p>
                  <p>
                    <span>Assignee</span>: {selectedTask.assignee}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-medium">Comment</h3>
                <p className="mt-2">{selectedTask?.comment || "No comment"}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <TaskStatusChangeDialog
        open={changeModalOpen}
        onOpenChange={setChangeModalOpen}
        onConfirm={handleTaskStatusChange}
        defaultComment={selectedTask?.comment}
      />
    </>
  );
}

export default TaskDetailsDialog;
