import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { io } from "socket.io-client";
import useAxios from "../../hooks/useAxios";

const socket = io("http://localhost:3000");

export default function TaskManager() {
  const api = useAxios();
  const [tasks, setTasks] = useState({
    "To-Do": [],
    "In Progress": [],
    Done: [],
  });

  // delete Tasks
  const deleteTasks = async (id) => {
    const res = await api.delete(`/tasks/${id}`);
    console.log(res?.data);
  };

  // Drag & Drop Functionality
  const handleDragEnd = async (result) => {
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

      const res = await api.put(`/tasks/${movedTask._id}`, {
        category: sourceCategory,
      });
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

      const res = await api.put(`/tasks/${movedTask._id}`, {
        category: destCategory,
      });

      console.log(res?.data);
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

    // Listen for Real-time Updates
    // add
    socket.on("taskAdded", (newTask) => {
      setTasks((prev) => ({
        ...prev,
        [newTask.category]: [...prev[newTask.category], newTask],
      }));
      console.log(newTask);
    });

    // delete
    socket.on("taskDeleted", (id) => {
      setTasks((prev) => {
        const updatedTasks = {};
        Object.keys(prev).forEach((category) => {
          updatedTasks[category] = prev[category].filter(
            (task) => task._id !== id
          );
        });
        return updatedTasks;
      });
    });

    // update
    socket.on("taskUpdated", (updatedFields, documentKey) => {
      setTasks((prev) => {
        const updatedTasks = {};
        Object.keys(prev).forEach((category) => {
          updatedTasks[category] = prev[category].map((task) => {
            return task._id === documentKey?._id
              ? { ...task, ...updatedFields }
              : task;
          });
        });
        setTasks(updatedTasks);
        return updatedTasks;
      });
    });
  }, []);

  const getTaskColor = (dueDate) => {
    if (!dueDate) return "bg-white";

    const now = new Date();
    const taskDueDate = new Date(dueDate);

    if (taskDueDate < now) {
      return "bg-red-200 border-red-400";
    } else if ((taskDueDate - now) / (1000 * 60 * 60 * 24) <= 2) {
      return "bg-yellow-200 border-yellow-400";
    } else {
      return "bg-green-200 border-green-400";
    }
  };

  return (
    <>
      <div className="w-11/12 mx-auto py-6 md:py-12">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            {Object.keys(tasks).map((category) => (
              <Droppable key={category} droppableId={category}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="bg-gray-100 p-4 rounded-lg shadow-md min-h-[200px]"
                  >
                    <h2 className="text-xl font-semibold mb-3 md:mb-6">
                      {category}
                    </h2>
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
                            className={`mb-3 p-3 rounded-lg shadow-md border ${getTaskColor(
                              task.dueDate
                            )}`}
                          >
                            <h3 className="text-lg font-bold mb-2 ">
                              {task.title}
                            </h3>
                            <p className="font-medium mb-2  text-gray-600">
                              {task.description}
                            </p>
                            <p className="text-sm mb-1 text-gray-400">
                              Created:{" "}
                              {new Date(task.timestamp).toLocaleString()}
                            </p>
                            <Link
                              to="/edit-tasks"
                              state={{
                                editTask: {
                                  title: task.title,
                                  description: task.description,
                                  timestamp: task.timestamp,
                                  category: task.category,
                                  id: task?._id,
                                },
                              }}
                              className="mr-4 bg-yellow-500 text-white px-3 py-1 rounded-md mt-2 hover:bg-yellow-600"
                            >
                              Edit
                            </Link>
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
    </>
  );
}
