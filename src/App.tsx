import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import TaskManager from "./components/TaskManager";

function App() {
  return (
    <div className="min-h-screen w-full">
      <Router>
        <Routes>
          <Route path="/" element={<TaskManager />} />
          <Route
            path="/*"
            element={
              <div className="flex items-center justify-center h-screen w-full">
                <p className="text-5xl">Page Not Found</p>
              </div>
            }
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
