import TaskManagerMain from "./TaskManager";

import { TaskManagerProvider } from "./utility/context";

export default function TaskManager() {
  return (
    <TaskManagerProvider>
      <TaskManagerMain />
    </TaskManagerProvider>
  );
}
