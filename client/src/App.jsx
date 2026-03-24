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
import { useEffect, useState } from "react";
import axios from "./api/axios";
import { setAccessToken } from "./api/tokenStore";
import DoctorDashBoard from "./pages/doctor/DoctorDashBoard";
import { Navigate } from "react-router-dom";
const PublicRoute = ({ children }) => {
  const { user } = useUser();
  if (user) {
    return (
      <Navigate
        to={user.role === "doctor" ? "/doctor/dashboard" : "/patient/home"}
        replace
      />
    );
  }
  return children;
};

const PrivateRoute = ({ children }) => {
  const { user } = useUser();
  if (!user) return <Navigate to="/auth/login" replace />;
  return children;
};

const App = () => {
  const locomotiveScroll = new LocomotiveScroll();

  const [loading, setLoading] = useState(true);
  const { user, setUser } = useUser();

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await axios.post("/auth/refresh-token");
        setAccessToken(res.data.token);
        const userData = res.data.user || res.data.dr;
        const { _id, name, email, profilePicture } = userData;
        setUser({ _id, name, email, profilePicture, role: res.data.role });
      } catch {
        // no session
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  if (loading) return null;

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/auth/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/auth/doctor/signup"
          element={
            <PublicRoute>
              <DoctorSignup />
            </PublicRoute>
          }
        />
        <Route
          path="/auth/patient/signup"
          element={
            <PublicRoute>
              <PatientSignup />
            </PublicRoute>
          }
        />

        <Route
          path="/patient/home"
          element={
            <PrivateRoute>
              <PatientHome />
            </PrivateRoute>
          }
        />
        <Route
          path="/doctor/dashboard"
          element={
            <PrivateRoute>
              <DoctorDashBoard />
            </PrivateRoute>
          }
        />

        <Route path="/auth/verify-email/:rawToken" element={<VerifyEmail />} />
      </Routes>
    </>
  );
};

export default App;
