import { useState, useRef, useEffect } from "react";
import {
  LayoutDashboard,
  LogOut,
  ChevronDown,
  UserCircle2,
  Stethoscope,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import logo from "../assets/logo.png";
import axios from "../api/axios";
import { useUser } from "../../context/userContext.jsx";
import { clearAccessToken } from "../api/tokenStore.js";

const Navbar = ({ isDash }) => {
  const [open, setOpen] = useState(false);

  const menuRef = useRef(null);

  const Navigate = useNavigate();

  const { user, setUser } = useUser();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post("/auth/logout");
    } catch (err) {
    } finally {
      clearAccessToken();

      setUser(null);

      toast.success("Logged out successfully.");

      Navigate("/");
    }
  };

  return (
    <div
      className="
        relative
        z-50
        w-full h-[9vh]
        flex items-center justify-between
        px-4 sm:px-[4vw] md:px-[3vw]
      "
    >
      {/* Logo */}

      <div
        className="
        w-[40vw]
        sm:w-[22vw]
        md:w-[13vw]
        h-full
        "
      >
        <img
          src={logo}
          alt="CuraNova"
          className="
          w-full h-full
          object-contain
          scale-95
          "
        />
      </div>

      {/* Profile */}

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setOpen(!open)}
          className="
          flex items-center gap-2
          px-3 py-2
          rounded-full
          border border-[#9b87f5]
          bg-[#ede9fe]
          text-[#7c5ce8]
          hover:bg-[#e7e1fd]
          transition-all
          cursor-pointer
          "
        >
          {user.role === "doctor" ? (
            <Stethoscope size={18} />
          ) : (
            <UserCircle2 size={18} />
          )}

          <span
            className="
            text-sm
            font-medium
            hidden sm:block
            "
          >
            {user.name}
          </span>

          <ChevronDown
            size={16}
            className={`
              transition-transform
              duration-200
              ${open ? "rotate-180" : ""}
            `}
          />
        </button>

        {/* Dropdown */}

        <div
          className={`
          absolute right-0 mt-2
          w-52
          bg-white
          rounded-2xl
          border border-gray-200
          shadow-xl
          overflow-hidden
          origin-top-right
          transition-all
          duration-200

          ${
            open
              ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
              : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
          }

          `}
        >
          {user.role === "patient" && (
            <button
              onClick={() => {
                {
                  isDash
                    ? Navigate("/patient/home")
                    : Navigate(`/patient/${user._id}/dashboard/`);
                }
              }}
              className="
            w-full
            flex items-center gap-3
            px-4 py-3
            hover:bg-[#f6f3ff]
            transition-colors
            cursor-pointer
            "
            >
              <LayoutDashboard size={18} className="text-[#7c5ce8]" />

              <span
                className="
              text-sm
              font-medium
              text-gray-700
              "
              >
                {isDash ? "Home" : "Dashboard"}
              </span>
            </button>
          )}

          <div
            className="
            h-px
            bg-gray-100
            "
          />

          <button
            onClick={handleLogout}
            className="
            w-full
            flex items-center gap-3
            px-4 py-3
            hover:bg-red-50
            transition-colors
            cursor-pointer
            "
          >
            <LogOut size={18} className="text-red-500" />

            <span
              className="
              text-sm
              font-medium
              text-red-500
              "
            >
              Logout
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
