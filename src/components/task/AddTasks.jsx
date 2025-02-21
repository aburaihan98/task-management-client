import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import useAxios from "../../hooks/useAxios";

function AddTasks() {
  const api = useAxios();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const title = e.target.title.value;
    const description = e.target.description.value;
    const category = e.target.category.value;

    const tasks = {
      title,
      description,
      category,
      timestamp: new Date().toISOString(),
    };

    const res = await api.post("/tasks", tasks);
    toast.success("Task added successfully!");
    navigate("/");
  };

  return (
    <div className="flex justify-center items-center py-6 md:py-12">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title Input */}
          <input
            type="text"
            name="title"
            placeholder="Task Title"
            className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300"
            maxLength={50}
          />

          {/* Description Textarea */}
          <textarea
            name="description"
            placeholder="Description"
            className="border border-gray-300 p-3 rounded-md w-full h-32 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300"
            maxLength={200}
          />

          {/* Category Select */}
          <select
            name="category"
            className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300"
          >
            <option value="To-Do">To-Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>

          {/* Submit Button */}
          <button className="bg-blue-500 text-white px-6 py-3 rounded-md w-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300">
            Add Task
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddTasks;
