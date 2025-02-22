import { useContext, useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { Link, NavLink } from "react-router-dom";
import Swal from "sweetalert2";
import { AuthContext } from "../../providers/AuthProvider";
import ThemeToggle from "./ThemeToggle";

const Navbar = () => {
  const { user, logOut } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logOut();

      Swal.fire({
        title: "Success!",
        text: "Successfully logged out!",
        icon: "success",
        confirmButtonColor: "#3085d6",
      });
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Logout failed. Please try again.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    }
  };

  return (
    <nav className="bg-blue-600 py-4">
      <div className="w-11/12 mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-white text-xl font-semibold">
          Task Manager
        </Link>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden text-white text-2xl"
        >
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-6 text-white font-semibold">
          <NavLink to="/" className="hover:border-b-2 border-white px-4 py-2">
            Home
          </NavLink>
          <NavLink
            to="/add-tasks"
            className="hover:border-b-2 border-white px-4 py-2"
          >
            Add Tasks
          </NavLink>
          <ThemeToggle />
          {user ? (
            <>
              <span>{user?.displayName}</span>
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

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-blue-700 text-white flex flex-col items-center mt-4 py-4">
          <NavLink
            to="/"
            className="py-2 text-lg"
            onClick={() => setIsOpen(false)}
          >
            Home
          </NavLink>
          <NavLink
            to="/add-tasks"
            className="py-2 text-lg"
            onClick={() => setIsOpen(false)}
          >
            Add Tasks
          </NavLink>
          <ThemeToggle />
          {user ? (
            <>
              <span className="py-2">{user?.displayName}</span>
              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 mt-2"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 mt-2"
              onClick={() => setIsOpen(false)}
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
