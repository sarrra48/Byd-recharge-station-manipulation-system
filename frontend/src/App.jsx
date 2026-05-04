import { Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";
import Reservation from "./Reservation";
import OtpPage from "./OtpPage";
import "./App.css"

export default function App() {
  return (
    <Routes>
      <Route path="/"         element={<HomePage />} />
      <Route path="/reserver" element={<Reservation />} />
      <Route path="/otp"      element={<OtpPage />} />
    </Routes>
  );
}
