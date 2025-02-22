import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import useAxios from "../../hooks/useAxios";

function EditTasks() {
  const api = useAxios();
  const location = useLocation();
  const navigate = useNavigate();

  // Get the task details passed through the state
  const { title, description, timestamp, category, id } =
    location.state.editTask;

  // Define state to manage task data in the form
  const [editTask, setEditTask] = useState({
    title,
    description,
    category,
    timestamp,
    id,
  });

  // Save the edited task
  const editSubmit = async (e) => {
    e.preventDefault();

    const updatedTask = {
      title: e.target.title.value,
      description: e.target.description.value,
      category: e.target.category.value,
      timestamp: new Date().toISOString(),
    };

    try {
      const res = await api.put(`/tasks/${id}`, updatedTask);

      if (res?.status === 200) {
        Swal.fire({
          title: "Success!",
          text: "Task updated successfully!",
          icon: "success",
          confirmButtonColor: "#3085d6",
        });

        navigate("/");
      } else {
        Swal.fire({
          title: "Error!",
          text: "Failed to update the task. Please try again.",
          icon: "error",
          confirmButtonColor: "#d33",
        });
      }
    } catch (error) {
      console.error("Error saving task:", error);
      Swal.fire({
        title: "Error!",
        text: "An error occurred while updating the task. Please try again later.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    }
  };

  // Update the state when form fields change
  const handleChange = (e) => {
    setEditTask((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="flex justify-center items-center py-6 md:py-12">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <form onSubmit={editSubmit} className="space-y-4">
          {/* Title Input */}
          <input
            type="text"
            name="title"
            placeholder="Task Title"
            className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300"
            maxLength={50}
            value={editTask.title}
            onChange={handleChange}
          />

          {/* Description Textarea */}
          <textarea
            name="description"
            placeholder="Description"
            className="border border-gray-300 p-3 rounded-md w-full h-32 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300"
            maxLength={200}
            value={editTask.description}
            onChange={handleChange}
          />

          {/* Category Select */}
          <select
            name="category"
            className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300"
            value={editTask.category}
            onChange={handleChange}
          >
            <option value="To-Do">To-Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>

          {/* Submit Button */}
          <div className="">
            <button className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300">
              Edit Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditTasks;
