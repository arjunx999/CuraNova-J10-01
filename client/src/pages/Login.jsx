import React, { useState } from "react";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import axios from "../api/axios.js";
import { setAccessToken } from "../api/tokenStore.js";
import { useUser } from "../../context/userContext.jsx";
import toast from "react-hot-toast";

const inputCls = "w-full px-3 py-2 text-sm rounded-lg bg-[#f8f8f8] border border-[#e6e6e6] focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition";

/* ── Reusable content panel ── */
const ContentPanel = ({ isDoctor }) => (
  <div className="hidden h-full shrink-0 flex-col justify-between bg-[#f4f3f1] p-10 md:flex md:w-[42%]">
    <div>
      <div className="mb-10 flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#9b87f5] opacity-75" style={{ animationDuration: "2s" }} />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#9b87f5]" />
        </span>
        <div className="w-32">
          <img src={logo} alt="" className="w-full scale-95 object-contain" />
        </div>
      </div>

      <h1 className="mb-4 text-2xl leading-snug font-semibold text-gray-900 xl:text-3xl">
        {isDoctor ? (
          <>
            Care delivered <span className="text-purple-600">by the best.</span>
          </>
        ) : (
          <>
            Healthcare at <span className="text-purple-600">your pace.</span>
          </>
        )}
      </h1>

      <p className="mb-8 text-sm leading-relaxed text-gray-500">{isDoctor ? "Manage your consultations, connect with patients, and grow your practice — all in one place." : "Short, focused consultations with verified doctors. Book a slot, describe your symptoms, join the call."}</p>

      <div className="flex flex-col items-start gap-3">
        {(isDoctor ? ["Set your own schedule", "You decide the consultation fee", "Get paid per call"] : ["Verified doctors only", "Secure payments", "No platform fee"]).map((item) => (
          <div key={item} className="flex items-center gap-2 text-sm text-[#707070]">
            <span className="flex h-4 w-4 items-center justify-center rounded-full border border-[#9b87f5]">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 5l2.5 2.5L8 3" stroke="#9b87f5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            {item}
          </div>
        ))}
      </div>
    </div>
    <p className="text-xs text-gray-400">CuraNova © 2025</p>
  </div>
);

/* ── Reusable form panel ── */
const FormPanel = ({ isDoctor, onNavigate }) => {
  const [showPassword, setShowPassword] = useState(false);
  const { setUser } = useUser();
  const Navigate = useNavigate();

  const [loginInfo, setLoginInfo] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoginInfo((prevInfo) => ({
      ...prevInfo,
      [name]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      if (!isDoctor) {
        const res = await axios.post("/auth/user/login", {
          email: loginInfo.email,
          password: loginInfo.password,
        });
        setAccessToken(res.data.token);
        const { _id, name, email, profilePicture } = res.data.user;
        setUser({ _id, name, email, profilePicture, role: "patient" });
        toast.success(`Welcome back, ${name}!`, { duration: 1500 });
        setTimeout(() => Navigate("/patient/home"), 1500);
      } else {
        const res = await axios.post("/auth/doctor/login", {
          email: loginInfo.email,
          password: loginInfo.password,
        });
        setAccessToken(res.data.token);
        const { _id, name, email, profilePicture } = res.data.dr;
        setUser({ _id, name, email, profilePicture, role: "doctor" });
        toast.success(`Welcome back, Dr. ${name}!`, { duration: 1500 });
        setTimeout(() => Navigate("/doctor/dashboard"), 1500);
      }
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message;

      if (status === 404) {
        toast.error("No account found with this email. Sign up instead.");
      } else if (status === 401 && message === "Please verify your email first") {
        toast.error("Please verify your email before logging in.");
      } else if (status === 401) {
        toast.error("Incorrect password. Try again.");
      } else {
        console.log(error);
        toast.error("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      {/* Mobile logo */}
      <div className="flex items-center gap-2 px-6 pt-6 pb-2 md:hidden">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#9b87f5] opacity-75" style={{ animationDuration: "2s" }} />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#9b87f5]" />
        </span>
        <img src={logo} alt="" className="h-5 object-contain" />
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-8 sm:px-10">
        <div className="w-full max-w-sm">
          <div className="mb-6">
            <h2 className="mb-0.5 text-lg font-semibold text-gray-800">{isDoctor ? "Doctor login" : "Welcome back"}</h2>
            <p className="text-xs text-gray-400">{isDoctor ? "Access your doctor dashboard" : "Login to find your doctor"}</p>
          </div>

          <form className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-gray-500">Email</label>
              <input type="email" placeholder="you@example.com" required className={inputCls} name="email" value={loginInfo.email} onChange={handleInputChange} />
            </div>

            <div className="relative">
              <label className="mb-1 block text-xs text-gray-500">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                className="w-full rounded-lg border border-[#e6e6e6] bg-[#f8f8f8] px-3 py-2 pr-9 text-sm transition outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                name="password"
                value={loginInfo.password}
                onChange={handleInputChange}
              />
              <span className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-gray-400 transition hover:text-gray-600" onClick={() => setShowPassword((prev) => !prev)} title={showPassword ? "Hide Password" : "Show Password"}>
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </span>
            </div>

            <button type="submit" className="mt-1 w-full cursor-pointer rounded-lg bg-black py-3 text-sm font-medium text-white transition hover:bg-[#1a1a1a]" onClick={handleLogin}>
              Login →
            </button>

            <p className="pb-2 text-center text-sm text-gray-500">
              Don't have an account?{" "}
              <span onClick={() => onNavigate(isDoctor ? "/auth/doctor/signup" : "/auth/patient/signup")} className="cursor-pointer text-purple-600 hover:underline">
                Sign up
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};
/* ── Main Login component ── */
const Login = () => {
  const Navigate = useNavigate();
  const [isDoctor, setIsDoctor] = useState(false);

  return (
    <div className="relative flex min-h-screen w-screen flex-col items-center justify-center overflow-hidden bg-[#f5f4f0] px-4 py-4">
      {/* blobs */}
      <div className="blob1 absolute top-0 left-0 z-0 h-full w-full opacity-100"></div>
      <div className="blob2 absolute top-20 right-70 z-0 h-full w-full opacity-100"></div>

      {/* ── Toggle pill ── */}
      <div className="relative z-10 mb-5">
        <div className="relative flex items-center rounded-full bg-white p-1 shadow-md">
          {/* sliding background */}
          <div className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-black shadow-sm transition-all duration-300 ease-in-out" style={{ left: isDoctor ? "calc(50% + 2px)" : "4px" }} />

          <button onClick={() => setIsDoctor(false)} className={`relative z-10 w-1/2 cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors duration-300 ${!isDoctor ? "text-white" : "text-gray-400 hover:text-gray-600"}`}>
            For Patients
          </button>
          <button onClick={() => setIsDoctor(true)} className={`relative z-10 w-1/2 cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors duration-300 ${isDoctor ? "text-white" : "text-gray-400 hover:text-gray-600"}`}>
            For Doctors
          </button>
        </div>
      </div>

      {/* ── Card ── */}
      <div className="relative z-10 w-full max-w-5xl overflow-hidden rounded-2xl shadow-lg" style={{ height: "72vh", maxHeight: "600px" }}>
        {/* Patient layout — form LEFT, content RIGHT */}
        <div
          className="absolute inset-0 flex flex-col bg-white md:flex-row"
          style={{
            transform: isDoctor ? "translateX(-100%)" : "translateX(0%)",
            transition: "transform 0.5s cubic-bezier(0.65, 0, 0.35, 1)",
          }}
        >
          <FormPanel isDoctor={false} onNavigate={Navigate} />
          <ContentPanel isDoctor={false} />
        </div>

        {/* Doctor layout — content LEFT, form RIGHT */}
        <div
          className="absolute inset-0 flex flex-col bg-white md:flex-row"
          style={{
            transform: isDoctor ? "translateX(0%)" : "translateX(100%)",
            transition: "transform 0.5s cubic-bezier(0.65, 0, 0.35, 1)",
          }}
        >
          <ContentPanel isDoctor={true} />
          <FormPanel isDoctor={true} onNavigate={Navigate} />
        </div>
      </div>
    </div>
  );
};

export default Login;
