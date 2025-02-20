import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { useEffect, useState } from "react";
import AddTasks from "../../components/task/AddTasks";
import useAxios from "../../hooks/useAxios";

export default function TaskManager() {
  const api = useAxios();
  const [tasks, setTasks] = useState({
    "To-Do": [],
    "In Progress": [],
    Done: [],
  });

  const deleteTasks = async (id) => {
    const res = await api.delete(`/tasks/${id}`);
    console.log(res?.data);
  };

  // Drag & Drop Functionality
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const sourceCategory = source.droppableId;
    const destCategory = destination.droppableId;

    if (sourceCategory === destCategory) {
      // Reorder within same category
      const reorderedTasks = Array.from(tasks[sourceCategory]);
      const [movedTask] = reorderedTasks.splice(source.index, 1);
      reorderedTasks.splice(destination.index, 0, movedTask);

      setTasks((prev) => ({ ...prev, [sourceCategory]: reorderedTasks }));
    } else {
      // Move to another category
      const sourceTasks = Array.from(tasks[sourceCategory]);
      const destTasks = Array.from(tasks[destCategory]);
      const [movedTask] = sourceTasks.splice(source.index, 1);
      movedTask.category = destCategory;
      destTasks.splice(destination.index, 0, movedTask);

      setTasks((prev) => ({
        ...prev,
        [sourceCategory]: sourceTasks,
        [destCategory]: destTasks,
      }));
    }
  };

  // task fetch
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.get("tasks");
        const categorizedTasks = {
          "To-Do": [],
          "In Progress": [],
          Done: [],
        };

        res.data.forEach((task) => {
          const category = task.category ? task.category.trim() : "";
          if (category in categorizedTasks) {
            categorizedTasks[category].push(task);
          } else {
            console.log(`Unrecognized category: ${category}`);
          }
        });
        setTasks(categorizedTasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchTasks();
  }, [api]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* add tasks  */}
      <AddTasks />

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-3 gap-6">
          {Object.keys(tasks).map((category) => (
            <Droppable key={category} droppableId={category}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="bg-gray-100 p-4 rounded-lg shadow-md min-h-[200px]"
                >
                  <h2 className="text-xl font-semibold mb-3">{category}</h2>
                  {tasks[category].map((task, index) => (
                    <Draggable
                      key={task._id}
                      draggableId={task._id.toString()}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="mb-3 p-3 bg-white rounded-lg shadow-md border border-gray-300"
                        >
                          <h3 className="font-bold">{task.title}</h3>
                          <p className="text-sm text-gray-600">
                            {task.description}
                          </p>
                          <p className="text-xs text-gray-400">
                            Created: {new Date(task.timestamp).toLocaleString()}
                          </p>
                          <button
                            onClick={() => deleteTasks(task._id, category)}
                            className="bg-red-500 text-white px-3 py-1 rounded-md mt-2 hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
