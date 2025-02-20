import useAxios from "../../hooks/useAxios";

function AddTasks() {
  const api = useAxios();

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

    console.log(res.data);
  };

  return (
    <div className="flex gap-4 mb-6">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Task Title"
          className="border border-gray-300 p-2 rounded-md w-1/3"
          maxLength={50}
        />
        <textarea
          name="description"
          placeholder="Description"
          className="border border-gray-300 p-2 rounded-md w-1/3"
          maxLength={200}
        />
        <select name="category">
          <option value="To-Do">To-Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
          Add Task
        </button>
      </form>
    </div>
  );
}

export default AddTasks;
