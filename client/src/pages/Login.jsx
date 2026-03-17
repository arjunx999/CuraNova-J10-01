import React, { useState } from "react";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";

const inputCls =
  "w-full px-3 py-2 text-sm rounded-lg bg-[#f8f8f8] border border-[#e6e6e6] focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition";

/* ── Reusable content panel ── */
const ContentPanel = ({ isDoctor }) => (
  <div className="hidden md:flex md:w-[42%] h-full bg-[#f4f3f1] p-10 flex-col justify-between shrink-0">
    <div>
      <div className="flex items-center gap-2 mb-10">
        <span className="relative flex h-2 w-2">
          <span
            className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#9b87f5] opacity-75"
            style={{ animationDuration: "2s" }}
          />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#9b87f5]" />
        </span>
        <div className="w-32">
          <img src={logo} alt="" className="w-full object-contain scale-95" />
        </div>
      </div>

      <h1 className="text-2xl xl:text-3xl font-semibold leading-snug text-gray-900 mb-4">
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

      <p className="text-gray-500 text-sm leading-relaxed mb-8">
        {isDoctor
          ? "Manage your consultations, connect with patients, and grow your practice — all in one place."
          : "Short, focused consultations with verified doctors. Book a slot, describe your symptoms, join the call."}
      </p>

      <div className="flex flex-col items-start gap-3">
        {(isDoctor
          ? [
              "Set your own schedule",
              "You decide the consultation fee",
              "Get paid per call",
            ]
          : ["Verified doctors only", "Secure payments", "No platform fee"]
        ).map((item) => (
          <div
            key={item}
            className="flex items-center gap-2 text-sm text-[#707070]"
          >
            <span className="flex items-center justify-center w-4 h-4 rounded-full border border-[#9b87f5]">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path
                  d="M2 5l2.5 2.5L8 3"
                  stroke="#9b87f5"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
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
const FormPanel = ({ isDoctor, onNavigate }) => (
  <div className="flex-1 flex flex-col overflow-y-auto">
    {/* Mobile logo */}
    <div className="flex md:hidden items-center gap-2 px-6 pt-6 pb-2">
      <span className="relative flex h-2 w-2">
        <span
          className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#9b87f5] opacity-75"
          style={{ animationDuration: "2s" }}
        />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#9b87f5]" />
      </span>
      <img src={logo} alt="" className="h-5 object-contain" />
    </div>

    <div className="flex-1 flex items-center justify-center px-6 sm:px-10 py-8">
      <div className="w-full max-w-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-0.5">
            {isDoctor ? "Doctor login" : "Welcome back"}
          </h2>
          <p className="text-xs text-gray-400">
            {isDoctor
              ? "Access your doctor dashboard"
              : "Login to find your doctor"}
          </p>
        </div>

        <form className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              required
              className={inputCls}
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              required
              className={inputCls}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-lg hover:bg-[#1a1a1a] transition font-medium text-sm cursor-pointer mt-1"
          >
            Login →
          </button>

          <p className="text-center text-sm text-gray-500 pb-2">
            Don't have an account?{" "}
            <span
              onClick={() =>
                onNavigate(
                  isDoctor ? "/auth/doctor/signup" : "/auth/patient/signup",
                )
              }
              className="text-purple-600 cursor-pointer hover:underline"
            >
              Sign up
            </span>
          </p>
        </form>
      </div>
    </div>
  </div>
);

/* ── Main Login component ── */
const Login = () => {
  const Navigate = useNavigate();
  const [isDoctor, setIsDoctor] = useState(false);

  return (
    <div className="min-h-screen w-screen bg-[#f5f4f0] flex flex-col items-center justify-center relative overflow-hidden py-4 px-4">
      {/* blobs */}
      <div className="blob1 absolute w-full h-full top-0 left-0 opacity-100 z-0"></div>
      <div className="blob2 absolute w-full h-full top-20 right-70 opacity-100 z-0"></div>

      {/* ── Toggle pill ── */}
      <div className="relative z-10 mb-5">
        <div className="relative flex items-center bg-white rounded-full shadow-md p-1">
          {/* sliding background */}
          <div
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-black shadow-sm transition-all duration-300 ease-in-out"
            style={{ left: isDoctor ? "calc(50% + 2px)" : "4px" }}
          />

          <button
            onClick={() => setIsDoctor(false)}
            className={`relative z-10 px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-300 cursor-pointer w-1/2 whitespace-nowrap ${
              !isDoctor ? "text-white" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            For Patients
          </button>
          <button
            onClick={() => setIsDoctor(true)}
            className={`relative z-10 px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-300 cursor-pointer w-1/2 whitespace-nowrap ${
              isDoctor ? "text-white" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            For Doctors
          </button>
        </div>
      </div>

      {/* ── Card ── */}
      <div
        className="w-full max-w-5xl relative z-10 rounded-2xl shadow-lg overflow-hidden"
        style={{ height: "72vh", maxHeight: "600px" }}
      >
        {/* Patient layout — form LEFT, content RIGHT */}
        <div
          className="absolute inset-0 flex flex-col md:flex-row bg-white"
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
          className="absolute inset-0 flex flex-col md:flex-row bg-white"
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
