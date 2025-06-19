import { Routes, Route } from "react-router-dom";
import Swap from "./pages/Swap/Swap";
import About from "./pages/About";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Swap />} />
      <Route path="/swap" element={<Swap />} />
      <Route path="/about" element={<About />} />
    </Routes>
  );
};

export default AppRoutes; 