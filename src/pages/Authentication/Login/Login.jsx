import { useContext } from "react";
import toast from "react-hot-toast";
import { FaGoogle } from "react-icons/fa";
import { AuthContext } from "../../../providers/AuthProvider";

const Login = () => {
  const { signInWithGoogle } = useContext(AuthContext);

  // Google login
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithGoogle();
      toast.success("Successfully logged in with Google!");
    } catch (error) {
      toast.error("Error: " + error.message);
    }
  };

  return (
    <div className="min-h-screen">
      <button
        onClick={handleGoogleLogin}
        className="bg-gradient-to-r from-blue-500 to-green-500 text-white w-full py-3 px-6 border border-transparent flex items-center justify-center gap-3 text-lg font-semibold shadow-lg hover:scale-105 transform transition-all duration-300 hover:from-blue-600 hover:to-green-600"
      >
        <FaGoogle className="text-xl" />
        <span>Login with Google</span>
      </button>
    </div>
  );
};

export default Login;
