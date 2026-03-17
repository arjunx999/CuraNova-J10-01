import React from "react";
import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import LocomotiveScroll from "locomotive-scroll";
import DoctorSignup from "./pages/doctor/DoctorSignup";
import PatientSignup from "./pages/patient/PatientSignup";
import Login from "./pages/Login";

const App = () => {
  const locomotiveScroll = new LocomotiveScroll();

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/doctor/signup" element={<DoctorSignup />} />
        <Route path="/auth/patient/signup" element={<PatientSignup />} />
      </Routes>
    </>
  );
};

export default App;
