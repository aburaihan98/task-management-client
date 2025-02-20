import { useContext } from "react";
import toast from "react-hot-toast";
import { FaGoogle } from "react-icons/fa";
import { AuthContext } from "../../../providers/AuthProvider";

const Login = () => {
  const { signInWithGoogle } = useContext(AuthContext);
  // google login
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithGoogle();
    } catch (error) {
      toast.error("Error: " + error.message);
    }
  };

  return (
    <button
      onClick={handleGoogleLogin}
      className="btn bg-primary text-white w-full py-3 border border-primaryColor rounded-md flex items-center justify-center gap-2 text-primaryColor font-semibold text-xl mb-2 hover:text-primary"
    >
      <FaGoogle />
      Login with Google
    </button>
  );
};

export default Login;
