import { useUser } from "../../context/userContext";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { clearAccessToken } from "../api/tokenStore";
import toast from "react-hot-toast";
import { LogOut } from "lucide-react";

const LogoutButton = () => {
  const { setUser } = useUser();
  const Navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post("/auth/logout");
    } catch {
    } finally {
      clearAccessToken();
      setUser(null);
      toast.success("Logged out successfully.");
      Navigate("/");
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#7c5ce8] bg-[#ede9fe] rounded-full hover:bg-[#9b87f5] hover:text-white transition-all duration-200 cursor-pointer"
    >
      <LogOut size={15} />
      Logout
    </button>
  );
};

export default LogoutButton;
