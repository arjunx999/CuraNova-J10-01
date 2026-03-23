import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import logo from "../assets/logo.png";
import { Check, X } from "lucide-react";

const VerifyEmail = () => {
  const { rawToken } = useParams();
  const Navigate = useNavigate();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const sendToken = async () => {
      try {
        await axios.post("http://localhost:7643/auth/user/verify-email", {
          token: rawToken,
        });
        setStatus("success");
        setTimeout(() => Navigate("/auth/login"), 3000);
      } catch (error) {
        console.error("Verification error:", error.response?.data);
        setStatus("error");
      }
    };

    sendToken();
  }, [rawToken]);

  return (
    <div className="min-h-screen w-screen bg-[#f5f4f0] flex items-center justify-center relative overflow-hidden px-4">
      {/* blobs */}
      <div className="blob1 absolute w-full h-full top-0 left-0 opacity-100 z-0" />
      <div className="blob2 absolute w-full h-full top-20 right-70 opacity-100 z-0" />

      <div className="relative z-10 bg-white rounded-2xl shadow-lg w-full max-w-md p-10 flex flex-col items-center text-center">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <span className="relative flex h-2 w-2">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#9b87f5] opacity-75"
              style={{ animationDuration: "2s" }}
            />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#9b87f5]" />
          </span>
          <img src={logo} alt="CuraNova" className="h-5 object-contain" />
        </div>

        {/* Loading */}
        {status === "loading" && (
          <>
            <div className="w-14 h-14 rounded-full border-4 border-[#ede9fe] border-t-[#9b87f5] animate-spin mb-6" />
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Verifying your email
            </h2>
            <p className="text-sm text-gray-400">
              Just a moment, hang tight...
            </p>
          </>
        )}

        {/* Success */}
        {status === "success" && (
          <>
            <div className="w-14 h-14 rounded-full bg-[#ede9fe] flex items-center justify-center mb-6">
              <Check size={26} stroke="#9b87f5" strokeWidth={2.5} />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Email verified!
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              Your account is now active. Redirecting you to login...
            </p>
            <div className="w-full bg-[#f4f3f1] rounded-full h-1.5 overflow-hidden">
              <div className="h-full bg-[#9b87f5] rounded-full animate-[progress_3s_linear_forwards]" />
            </div>
            <style>{`
              @keyframes progress {
                from { width: 0% }
                to   { width: 100% }
              }
            `}</style>
          </>
        )}

        {/* Error */}
        {status === "error" && (
          <>
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-6">
              <X size={26} stroke="#ef4444" strokeWidth={2.5} />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Verification failed
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              This link may have expired or already been used.
            </p>
            <button
              onClick={() => Navigate("/auth/patient/signup")}
              className="w-full bg-black text-white py-2.5 rounded-lg hover:bg-[#1a1a1a] transition font-medium text-sm cursor-pointer"
            >
              Back to Signup
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
