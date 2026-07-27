import { useState, useMemo } from "react";
import { CalendarDays, Clock } from "lucide-react";

const formatTime = (time24) => {
  const [h, m] = time24.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
};

const DoctorAvailabilityCalendar = ({ slots = [] }) => {
  const slotsByDate = useMemo(() => {
    const map = {};
    slots.forEach((slot) => {
      const dateKey = slot.date?.split("T")[0];
      if (!dateKey) return;
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(slot);
    });
    Object.values(map).forEach((arr) => arr.sort((a, b) => a.start_time.localeCompare(b.start_time)));
    return map;
  }, [slots]);

  const sortedDates = useMemo(() => Object.keys(slotsByDate).sort(), [slotsByDate]);
  const [selectedDate, setSelectedDate] = useState(sortedDates[0] || null);
  const slotsForDay = selectedDate ? slotsByDate[selectedDate] || [] : [];
  const isBooked = (slot) => !slot.isAvailable || !!slot.bookedBy;

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">Availability calendar</h2>

        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Open
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-400" />
            Booked
          </span>
        </div>
      </div>

      {/* Date Selector */}
      <div className="mb-3 flex items-center gap-2 text-sm text-gray-600">
        <CalendarDays size={15} className="text-[#9b87f5]" />
        Select date
      </div>

      {sortedDates.length === 0 ? (
        <p className="py-4 text-center text-xs text-gray-400">No slots created yet.</p>
      ) : (
        <div className="scrollbar-hide mb-6 flex gap-3 overflow-x-auto pb-3">
          {sortedDates.map((dateKey) => {
            const dateObj = new Date(dateKey);
            const dayLabel = dateObj.toLocaleDateString("en-US", {
              weekday: "short",
            });
            const dayNum = dateObj.getDate();
            const dayHasBooked = slotsByDate[dateKey].some(isBooked);
            const dayHasOpen = slotsByDate[dateKey].some((s) => !isBooked(s));
            const active = selectedDate === dateKey;

            return (
              <button
                key={dateKey}
                onClick={() => setSelectedDate(dateKey)}
                className={`relative flex h-[68px] min-w-[68px] shrink-0 cursor-pointer flex-col items-center justify-center rounded-2xl border transition-all ${
                  active ? "border-[#7c5ce8] bg-[#7c5ce8] text-white shadow-md shadow-purple-200" : "border-gray-100 bg-white text-gray-500 hover:border-[#9b87f5]"
                } `}
              >
                <span className="text-[10px] opacity-80">{dayLabel}</span>
                <span className="text-base font-semibold">{dayNum}</span>

                <span className="mt-0.5 flex items-center gap-1">
                  {dayHasOpen && <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-white" : "bg-emerald-400"}`} />}
                  {dayHasBooked && <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-white/70" : "bg-red-400"}`} />}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Slots */}
      <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
        <Clock size={14} className="text-[#9b87f5]" />
        Slots for{" "}
        {selectedDate
          ? new Date(selectedDate).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })
          : "—"}
      </div>

      {slotsForDay.length === 0 ? (
        <p className="py-4 text-center text-xs text-gray-400">No slots on this day.</p>
      ) : (
        <div className="grid max-w-3xl grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
          {slotsForDay.map((slot) => {
            const booked = isBooked(slot);
            return (
              <div key={slot._id} title={booked ? "Booked" : "Open"} className={`flex h-9 items-center justify-center rounded-lg border text-[11px] font-medium ${booked ? "border-red-100 bg-red-50 text-red-500" : "border-emerald-100 bg-emerald-50 text-emerald-600"} `}>
                {formatTime(slot.start_time)}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DoctorAvailabilityCalendar;
