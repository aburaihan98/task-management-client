import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import useAxios from "../../hooks/useAxios";
import { AuthContext } from "./../../providers/AuthProvider";

export default function TaskManager() {
  const { user } = useContext(AuthContext);
  const api = useAxios();
  const [tasks, setTasks] = useState({
    "To-Do": [],
    "In Progress": [],
    Done: [],
  });

  // delete Tasks
  const deleteTasks = async (id, category) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });
    if (result.isConfirmed) {
      const updatedTasks = { ...tasks };
      updatedTasks[category] = updatedTasks[category].filter(
        (task) => task._id !== id
      );
      setTasks(updatedTasks);

      try {
        const res = await api.delete(`/tasks/${id}`);
        if (res.status !== 200) {
          updatedTasks[category].push(
            tasks[category].find((task) => task._id === id)
          );
          setTasks(updatedTasks);
        }

        Swal.fire({
          title: "Deleted!",
          text: "Your file has been deleted.",
          icon: "success",
        });
      } catch (error) {
        updatedTasks[category].push(
          tasks[category].find((task) => task._id === id)
        );
        setTasks(updatedTasks);

        Swal.fire({
          title: "Error!",
          text: "There was an issue deleting the task.",
          icon: "error",
        });
      }
    }
  };

  // task fetch
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.get(`/tasks?email=${user?.email}`);

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
  }, []);

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
      <div className="w-11/12 mx-auto min-h-screen py-6 md:py-12">
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
                            <p className="font-medium mb-2">
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
