import { createBrowserRouter } from "react-router-dom";
import AddTasks from "../components/task/AddTasks";
import EditTasks from "../components/task/EditTasks";
import Main from "../layouts/Main";
import Login from "../pages/Authentication/Login/Login";
import ErrorPage from "../pages/ErrorPage";
import Home from "../pages/Home";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Main />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "/add-tasks",
        element: <AddTasks />,
      },
      {
        path: "/edit-tasks",
        element: <EditTasks />,
      },
      {
        path: "/login",
        element: <Login />,
      },
    ],
  },
]);

export default router;
