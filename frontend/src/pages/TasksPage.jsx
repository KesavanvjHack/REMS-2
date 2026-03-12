import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import DataTable from "../components/ui/DataTable";
import Badge from "../components/ui/Badge";

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await axiosInstance.get("tasks/tasks/");
      setTasks(res.data.results || res.data);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: "title", label: "Task Title" },
    { key: "project_name", label: "Project" },
    { key: "priority", label: "Priority", render: (v) => <Badge variant={v === 'HIGH' || v === 'URGENT' ? 'danger' : 'info'}>{v}</Badge> },
    { key: "status", label: "Status", render: (v) => <Badge variant={v === 'DONE' ? 'success' : 'warning'}>{v}</Badge> },
    { key: "due_date", label: "Due Date" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Task Management</h1>
        <p className="text-sm text-gray-400">Manage your daily work items and tickets</p>
      </div>

      <div className="bg-dark-800 border border-dark-600 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 text-center text-gray-400">Loading tasks...</div>
        ) : (
          <DataTable columns={columns} data={tasks} emptyMessage="No tasks assigned to you." />
        )}
      </div>
    </div>
  );
};

export default TasksPage;
