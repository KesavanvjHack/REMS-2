import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import axiosInstance from "../api/axiosInstance";
import Badge from "../components/ui/Badge";

const COLUMNS = {
  TODO: { id: "TODO", title: "To Do", bg: "bg-gray-500/10", border: "border-gray-500/20", text: "text-gray-400" },
  IN_PROGRESS: { id: "IN_PROGRESS", title: "In Progress", bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-400" },
  REVIEW: { id: "REVIEW", title: "Review", bg: "bg-purple-500/10", border: "border-purple-500/20", text: "text-purple-400" },
  DONE: { id: "DONE", title: "Done", bg: "bg-green-500/10", border: "border-green-500/20", text: "text-green-400" },
};

const KanbanPage = () => {
  const [tasks, setTasks] = useState({
    TODO: [],
    IN_PROGRESS: [],
    REVIEW: [],
    DONE: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await axiosInstance.get("tasks/tasks/");
      const data = res.data.results || res.data;
      
      const newTasks = { TODO: [], IN_PROGRESS: [], REVIEW: [], DONE: [] };
      data.forEach(task => {
        if (newTasks[task.status]) {
          newTasks[task.status].push(task);
        }
      });
      
      // Sort each column by 'order'
      Object.keys(newTasks).forEach(key => {
        newTasks[key].sort((a, b) => a.order - b.order);
      });
      
      setTasks(newTasks);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    } finally {
      setLoading(false);
    }
  };

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // Moving within columns
    const startCol = Array.from(tasks[source.droppableId]);
    const endCol = Array.from(tasks[destination.droppableId]);
    const movedTask = startCol.find(t => t.id.toString() === draggableId);

    // Remove from source
    startCol.splice(source.index, 1);
    
    if (source.droppableId === destination.droppableId) {
      // Reorder within same column
      startCol.splice(destination.index, 0, movedTask);
      const newState = { ...tasks, [source.droppableId]: startCol };
      setTasks(newState);
      
      // Update order on server (optional: debounce/batch)
      await updateTaskStatus(draggableId, movedTask.status, destination.index);
    } else {
      // Move to different column
      movedTask.status = destination.droppableId;
      endCol.splice(destination.index, 0, movedTask);
      
      const newState = {
        ...tasks,
        [source.droppableId]: startCol,
        [destination.droppableId]: endCol
      };
      setTasks(newState);
      
      // Update status on server
      await updateTaskStatus(draggableId, destination.droppableId, destination.index);
    }
  };

  const updateTaskStatus = async (taskId, status, order) => {
    try {
      await axiosInstance.patch(`tasks/tasks/${taskId}/`, { status, order });
    } catch (err) {
      console.error("Failed to update task", err);
      // Rollback might be needed in production
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Loading Kanban...</div>;

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white">Project Kanban</h1>
          <p className="text-sm text-gray-400">Visualize work progress and manage task lifecycle</p>
        </div>
        <div className="flex gap-2">
            <button className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors">
                + New Task
            </button>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
          {Object.entries(COLUMNS).map(([id, col]) => (
            <div key={id} className={`flex-1 min-w-[300px] flex flex-col rounded-2xl ${col.bg} border ${col.border}`}>
              <div className="p-4 flex items-center justify-between border-b border-dark-600/50">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${id === 'TODO' ? 'bg-gray-400' : id === 'IN_PROGRESS' ? 'bg-blue-400' : id === 'REVIEW' ? 'bg-purple-400' : 'bg-green-400'}`}></span>
                  <h3 className="font-semibold text-white">{col.title}</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-dark-600 text-xs text-gray-400 font-medium">
                  {tasks[id].length}
                </span>
              </div>

              <Droppable droppableId={id}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`flex-1 p-3 space-y-3 overflow-y-auto transition-colors duration-200 ${snapshot.isDraggingOver ? 'bg-white/5' : ''}`}
                  >
                    {tasks[id].map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`group bg-dark-800 border border-dark-600 rounded-xl p-4 shadow-sm hover:border-accent/40 transition-all cursor-grab active:cursor-grabbing ${snapshot.isDragging ? 'shadow-2xl border-accent rotate-1 scale-105 z-50' : ''}`}
                          >
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-[10px] font-bold tracking-wider uppercase ${task.priority === 'HIGH' || task.priority === 'URGENT' ? 'text-red-400' : 'text-blue-400'}`}>
                                    {task.priority}
                                </span>
                                <span className="text-[10px] text-gray-500 font-mono">#{task.id}</span>
                            </div>
                            <h4 className="text-sm font-medium text-white group-hover:text-accent transition-colors leading-snug">
                                {task.title}
                            </h4>
                            <div className="mt-4 flex items-center justify-between">
                                <div className="flex -space-x-1.5 overflow-hidden">
                                     <div className="w-6 h-6 rounded-full bg-accent/20 border-2 border-dark-800 flex items-center justify-center text-[10px] text-accent font-bold">
                                        {task.assignee_name?.charAt(0) || '?'}
                                     </div>
                                </div>
                                <div className="flex items-center gap-2 text-gray-500">
                                    <span className="text-[10px] flex items-center gap-1">
                                        📅 {task.due_date || 'No date'}
                                    </span>
                                </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanPage;
