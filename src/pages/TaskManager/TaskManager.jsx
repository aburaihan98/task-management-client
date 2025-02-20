import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import AddTasks from "../../components/task/AddTasks";
import useAxios from "../../hooks/useAxios";

const socket = io("http://localhost:3000");

export default function TaskManager() {
  const api = useAxios();
  const [tasks, setTasks] = useState({
    "To-Do": [],
    "In Progress": [],
    Done: [],
  });
  const [editTask, setEditTask] = useState("");

  // Edit Task
  // handle edit
  const handleEdit = async (id, title, description, category) => {
    setEditTask({ id, title, description, category });
  };
  // save edit
  const editSubmit = async (e) => {
    e.preventDefault();

    const title = e.target.title.value;
    const description = e.target.description.value;
    const category = e.target.category.value;

    const updatedTask = {
      title,
      description,
      category,
      timestamp: new Date().toISOString(),
    };

    try {
      const res = await api.put(`/tasks/${editTask.id}`, updatedTask);
      console.log(res.data);

      setEditTask(null);
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };

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
      <div className="p-6 max-w-5xl mx-auto">
        {/* add tasks  */}
        <AddTasks />

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
                            className={`mb-3 p-3 rounded-lg shadow-md border ${getTaskColor(
                              task.dueDate
                            )}`}
                          >
                            <h3 className="font-bold">{task.title}</h3>
                            <p className="text-sm text-gray-600">
                              {task.description}
                            </p>
                            <p className="text-xs text-gray-400">
                              Created:{" "}
                              {new Date(task.timestamp).toLocaleString()}
                            </p>
                            <button
                              onClick={() =>
                                handleEdit(
                                  task._id,
                                  task.title,
                                  task.description,
                                  task.category
                                )
                              }
                              className="bg-yellow-500 text-white px-3 py-1 rounded-md mt-2 hover:bg-yellow-600"
                            >
                              Edit
                            </button>
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

      {/* Modal */}
      {editTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <form onSubmit={editSubmit} className="space-y-4">
              {/* Title Input */}
              <input
                type="text"
                name="title"
                placeholder="Task Title"
                className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300"
                maxLength={50}
                value={editTask?.title}
                onChange={(e) =>
                  setEditTask((prev) => ({ ...prev, title: e.target.value }))
                }
              />

              {/* Description Textarea */}
              <textarea
                name="description"
                placeholder="Description"
                className="border border-gray-300 p-3 rounded-md w-full h-32 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300"
                maxLength={200}
                value={editTask?.description}
                onChange={(e) =>
                  setEditTask((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />

              {/* Category Select */}
              <select
                name="category"
                className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300"
                value={editTask?.category}
                onChange={(e) =>
                  setEditTask((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
              >
                <option value="To-Do">To-Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>

              {/* Submit Button */}
              <div className="flex justify-between space-x-4">
                {/* Cancel Button */}
                <div className="flex justify-start">
                  <button
                    type="button"
                    onClick={() => setEditTask(null)}
                    className="bg-gray-500 text-white px-6 py-3 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 transition duration-300"
                  >
                    Cancel
                  </button>
                </div>
                <div className="flex justify-end">
                  <button className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300">
                    Edit Task
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
