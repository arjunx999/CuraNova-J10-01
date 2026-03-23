import React from "react";
import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import LocomotiveScroll from "locomotive-scroll";
import DoctorSignup from "./pages/doctor/DoctorSignup";
import PatientSignup from "./pages/patient/PatientSignup";
import Login from "./pages/Login";
import VerifyEmail from "./pages/VerifyEmail";
import { Toaster } from "react-hot-toast";
import PatientHome from "../src/pages/patient/PatientHome";
import { useUser } from "../context/userContext";
import { useEffect } from "react";
import axios from "./api/axios";
import { setAccessToken } from "./api/tokenStore";

const App = () => {
  const locomotiveScroll = new LocomotiveScroll();

  const { setUser } = useUser();

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await axios.post("/auth/refresh-token");
        setAccessToken(res.data.token);
        const { _id, name, email, profilePicture } = res.data.user;
        const { role } = res.data;
        setUser({ _id, name, email, profilePicture, role });
      } catch {
        // no valid refresh token
      }
    };

    restoreSession();
  }, []);

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/doctor/signup" element={<DoctorSignup />} />
        <Route path="/auth/patient/signup" element={<PatientSignup />} />
        <Route path="/patient/home" element={<PatientHome />} />
        <Route path="/auth/verify-email/:rawToken" element={<VerifyEmail />} />
      </Routes>
    </>
  );
};

export default App;
