import { CalendarDays, Clock } from "lucide-react";

const AvailabilityCard = () => {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-5">
      <h2 className="text-sm font-semibold text-gray-800 mb-5">
        Add availability
      </h2>

      {/* Date */}

      <div className="mb-3">
        <input
          type="date"
          className="
            w-full h-10 rounded-xl
            border border-gray-200
            px-3
            text-sm text-gray-500
            outline-none
            focus:border-[#9b87f5]
          "
        />
      </div>

      {/* Time */}

      <div className="grid grid-cols-2 gap-3 mb-4">
        <input
          type="time"
          className="
            w-full h-10 rounded-xl
            border border-gray-200
            px-3
            text-sm
            outline-none
            focus:border-[#9b87f5]
          "
        />

        <input
          type="time"
          className="
            w-full h-10 rounded-xl
            border border-gray-200
            px-3
            text-sm
            outline-none
            focus:border-[#9b87f5]
          "
        />
      </div>

      {/* Slot + Break */}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-400 block mb-1">
            Slot length(min)
          </label>

          <input
            defaultValue="15"
            className="
              w-full h-10 rounded-xl
              border border-gray-200
              px-3
              text-sm
              outline-none
              focus:border-[#9b87f5]
            "
          />
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1">Break(min)</label>

          <input
            defaultValue="5"
            className="
              w-full h-10 rounded-xl
              border border-gray-200
              px-3
              text-sm
              outline-none
              focus:border-[#9b87f5]
            "
          />
        </div>
      </div>

      {/* Create */}

      <button
        className="
          w-full h-10 rounded-xl
          bg-[#8b00ff]
          hover:bg-[#7c5ce8]
          text-white
          text-sm font-medium
          transition
          mt-4
        "
      >
        Create slots
      </button>

      {/* Bottom */}

      <div className="border-t border-gray-100 mt-4 pt-4">
        <p className="text-xs text-gray-400">No upcoming slots yet.</p>
      </div>
    </div>
  );
};

export default AvailabilityCard;
