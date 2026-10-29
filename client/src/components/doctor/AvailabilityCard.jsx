import { CalendarDays, Clock } from "lucide-react";
import { useState } from "react";
import axios from "../../api/axios";
import toast from "react-hot-toast";

const AvailabilityCard = ({ onSlotCreated }) => {
  const [formData, setFormData] = useState({
    date: "",
    start_time: "",
    end_time: "",
    slot_duration: 0,
    break_duration: 0,
  });

  const getLocalDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const today = getLocalDate(new Date());

  const getEarliestTime = () => {
    if (formData.date !== today) return "00:00";
    const now = new Date();
    const minute = Math.ceil(now.getMinutes() / 5) * 5;
    now.setMinutes(minute, 0, 0);
    return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const selectedStart = new Date(`${formData.date}T${formData.start_time}`);
    if (!formData.date || !formData.start_time || selectedStart < new Date()) {
      toast.error("Start time must be now or later.");
      return;
    }
    if (!formData.end_time || formData.end_time <= formData.start_time) {
      toast.error("End time must be after the start time.");
      return;
    }

    try {
      const res = await axios.post("/doctor/add-slot", formData, {
        withCredentials: true,
      });

      toast.success(res.data.message);

      setFormData({
        date: "",
        start_time: "",
        end_time: "",
        slot_duration: 0,
        break_duration: 0,
      });

      onSlotCreated?.();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-4 sm:p-5">
      <h2 className="mb-5 text-sm font-semibold text-gray-800">Add availability</h2>

      {/* Date */}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="mb-1 block text-xs text-gray-400">Date</label>
          <input type="date" min={today} className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#9b87f5]" name="date" value={formData.date} required onChange={handleChange} />
        </div>

        {/* Time */}

        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-gray-400">Start Time</label>
            <input type="time" min={getEarliestTime()} className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#9b87f5]" name="start_time" value={formData.start_time} required onChange={handleChange} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-400">End Time</label>
            <input type="time" className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#9b87f5]" name="end_time" value={formData.end_time} required onChange={handleChange} />
          </div>
        </div>

        {/* Slot + Break */}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-gray-400">Slot length(min)</label>

            <input className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#9b87f5]" name="slot_duration" value={formData.slot_duration} required onChange={handleChange} type="number" />
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-400">Break(min)</label>

            <input className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#9b87f5]" type="number" name="break_duration" value={formData.break_duration} required onChange={handleChange} />
          </div>
        </div>

        {/* Create */}

        <button className="mt-4 h-10 w-full cursor-pointer rounded-xl bg-[#8b00ff] text-sm font-medium text-white transition hover:bg-[#7c5ce8]">Create slots</button>
      </form>
    </div>
  );
};

export default AvailabilityCard;
