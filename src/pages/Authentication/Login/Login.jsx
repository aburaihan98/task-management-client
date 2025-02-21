import { motion } from "framer-motion";
import { useContext } from "react";
import toast from "react-hot-toast";
import { FaGoogle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../providers/AuthProvider";

const Login = () => {
  const { signInWithGoogle } = useContext(AuthContext);
  const navigate = useNavigate();

  // Google login
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithGoogle();
      toast.success("Successfully logged in with Google!");
      navigate(location.state ? location.state : "/");
    } catch (error) {
      toast.error("Error: " + error.message);
    }
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center text-center px-6">
      {/* Text Section */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
          Welcome to Task Manager
        </h1>
        <p className="text-gray-600 mt-3 text-lg">
          Manage your tasks efficiently and stay productive.
        </p>
      </motion.div>

      {/* Login Button */}
      <motion.button
        onClick={handleGoogleLogin}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        whileHover={{ scale: 1.05 }}
        className="bg-gradient-to-r from-blue-500 to-green-500 text-white w-full max-w-sm py-3 px-6 border border-transparent flex items-center justify-center gap-3 text-lg font-semibold shadow-lg transition-all duration-300 hover:from-blue-600 hover:to-green-600"
      >
        <FaGoogle className="text-xl" />
        <span>Login with Google</span>
      </motion.button>
    </div>
  );
};

export default Login;
