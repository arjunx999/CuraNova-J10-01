import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import logo from "../assets/logo.png";
import { Check, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";

const VerifyEmail = () => {
  const { rawToken } = useParams();
  const Navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role");

  useEffect(() => {
    const sendToken = async () => {
      try {
        await api.post(`/auth/verify-email?role=${role}`, {
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
    <div className="relative flex min-h-screen w-screen items-center justify-center overflow-hidden bg-[#f5f4f0] px-4">
      {/* blobs */}
      <div className="blob1 absolute top-0 left-0 z-0 h-full w-full opacity-100" />
      <div className="blob2 absolute top-20 right-70 z-0 h-full w-full opacity-100" />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center rounded-2xl bg-white p-10 text-center shadow-lg">
        {/* Logo */}
        <div className="mb-8 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#9b87f5] opacity-75" style={{ animationDuration: "2s" }} />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#9b87f5]" />
          </span>
          <img src={logo} alt="CuraNova" className="h-5 object-contain" />
        </div>

        {/* Loading */}
        {status === "loading" && (
          <>
            <div className="mb-6 h-14 w-14 animate-spin rounded-full border-4 border-[#ede9fe] border-t-[#9b87f5]" />
            <h2 className="mb-2 text-lg font-semibold text-gray-800">Verifying your email</h2>
            <p className="text-sm text-gray-400">Just a moment, hang tight...</p>
          </>
        )}

        {/* Success */}
        {status === "success" && (
          <>
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#ede9fe]">
              <Check size={26} stroke="#9b87f5" strokeWidth={2.5} />
            </div>
            <h2 className="mb-2 text-lg font-semibold text-gray-800">Email verified!</h2>
            <p className="mb-6 text-sm text-gray-400">Your account is now active. Redirecting you to login...</p>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#f4f3f1]">
              <div className="h-full animate-[progress_3s_linear_forwards] rounded-full bg-[#9b87f5]" />
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
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
              <X size={26} stroke="#ef4444" strokeWidth={2.5} />
            </div>
            <h2 className="mb-2 text-lg font-semibold text-gray-800">Verification failed</h2>
            <p className="mb-6 text-sm text-gray-400">This link may have expired or already been used.</p>
            <button onClick={() => Navigate("/auth/patient/signup")} className="w-full cursor-pointer rounded-lg bg-black py-2.5 text-sm font-medium text-white transition hover:bg-[#1a1a1a]">
              Back to Signup
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
