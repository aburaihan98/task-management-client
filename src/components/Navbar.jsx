import { useContext } from "react";
import { AuthContext } from "../providers/AuthProvider";

const Navbar = () => {
  const { user, logOut } = useContext(AuthContext);

  return (
    <nav className="bg-indigo-600 p-4 flex justify-between items-center">
      <h1 className="text-white text-xl font-semibold">Task Manager</h1>
      <div className="flex items-center gap-4">
        <span className="text-white">{user?.displayName}</span>
        <button
          onClick={logOut}
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
