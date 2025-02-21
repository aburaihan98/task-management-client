import { Outlet } from "react-router-dom";
import Footer from "../components/shared/Footer";
import Navbar from "../components/shared/Navbar";

const Main = () => {
  return (
    <div className="">
      <Navbar />
      {/* Outlet */}
      <div className="">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default Main;
