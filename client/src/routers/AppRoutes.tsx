import HomePage from "@/pages/Home/HomePage";
import { Routes, Route } from "react-router-dom";

export default function AppRoute() {
  return (
    <Routes>
      {/* Example routes, replace with your actual components */}
      <Route path="/" element={<HomePage />} />
    </Routes>
  );
}
