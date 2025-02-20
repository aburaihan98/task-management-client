import { useContext } from "react";
import toast from "react-hot-toast";
import { Link, NavLink } from "react-router-dom";
import { AuthContext } from "../providers/AuthProvider";
import ThemeToggle from "./ThemeToggle";

const Navbar = () => {
  const { user, logOut } = useContext(AuthContext);

  const handleLogout = async () => {
    try {
      const res = await logOut();
      toast.success("Successfully logged out!");
    } catch (error) {
      toast.error("Logout failed. Please try again.");
    }
  };

  return (
    <nav className="bg-blue-600 py-6 ">
      <div className="w-11/12 mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-xl font-semibold">
          Task Manager
        </Link>
        <div className="font-semibold text-white">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? "border-b-2 border-blue-900 mr-4" : "mr-4"
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/add-tasks"
            className={({ isActive }) =>
              isActive ? "border-b-2 border-blue-900 mr-4" : "mr-4"
            }
          >
            Add Tasks
          </NavLink>
        </div>
        <div className="flex items-center gap-4 text-white font-semibold">
          <ThemeToggle />
          {user ? (
            <>
              <span className="text-white">{user?.displayName}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="bg-blue-700 text-white px-3 py-1 rounded hover:bg-blue-800"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
