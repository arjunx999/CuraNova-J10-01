import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BadgeCheck,
  Star,
  MapPin,
  Clock,
  Languages,
  Stethoscope,
  CalendarDays,
  Users,
  Briefcase,
} from "lucide-react";
import axios from "../../api/axios";

const MOCK_DOCTOR = {
  _id: "abc123",
  name: "Dr. Riya Sharma",
  profilePicture: null,
  isVerified: true,
  degrees: ["MBBS", "MD"],
  experience: 8,
  department: "Cardiology",
  hospital_name: "Apollo Hospital, Delhi",
  rating: 4.9,
  rating_count: 132,
  consultation_fee: 499,
  bio: "Dr. Riya Sharma is a cardiologist with 8 years of experience treating patients with heart conditions, hypertension, and arrhythmias. She completed her MD from AIIMS Delhi and specialises in non-invasive cardiac procedures.",
  available_days: "Mon – Sat",
  languages: ["Hindi", "English"],
  patients_count: 1200,
};

const MOCK_TAKEN_SLOTS = ["9:00 AM", "9:30 AM", "11:30 AM", "2:30 PM"];

const ALL_SLOTS = [
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
];

const getNextDays = (count = 6) => {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      label: i === 0 ? "Today" : `${dayNames[d.getDay()]} ${d.getDate()}`,
      fullDate: d.toISOString().split("T")[0],
    };
  });
};

const StarRating = ({ rating, size = 12 }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        size={size}
        className={
          s <= Math.round(rating)
            ? "text-[#9b87f5] fill-[#9b87f5]"
            : "text-gray-200 fill-gray-200"
        }
      />
    ))}
  </div>
);

const StatBox = ({ value, label, sub }) => (
  <div className="bg-[#faf9ff] border border-[#ede9fe] rounded-xl p-3.5 text-center flex flex-col items-center gap-1.5">
    <span className="text-xl font-semibold text-[#7c5ce8] leading-none">
      {value}
    </span>
    {sub}
    <span className="text-[10px] text-gray-400 leading-tight">{label}</span>
  </div>
);

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-b-0">
    <div className="flex items-center gap-2 text-gray-400">
      <Icon size={13} />
      <span className="text-xs">{label}</span>
    </div>
    <span className="text-xs font-medium text-gray-700 text-right max-w-[60%]">
      {value}
    </span>
  </div>
);

const DoctorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState();
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await axios.get(`/doctor/get-doctor-info/${id}`);
        console.log(res);
        setDoctor(res.data.doctor);
        setSlots(res.data.slots);
      } catch (error) {
        console.log(error);
      }
    };
    fetchDetails();
  }, []);

  // TODO: replace MOCK_DOCTOR with real fetched data using id
  const Doctor = MOCK_DOCTOR;

  const days = getNextDays(6);
  const [selectedDay, setSelectedDay] = useState(days[0].fullDate);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // TODO: replace MOCK_TAKEN_SLOTS with slots fetched for selectedDay
  const takenSlots = MOCK_TAKEN_SLOTS;

  const initials = Doctor.name
    .replace("Dr. ", "")
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <div className="w-screen min-h-screen overflow-x-hidden bg-[#f5f4f0]">
      {/* navbar */}
      <div className="w-full bg-white border-b border-gray-100 h-[9vh] flex items-center justify-between px-4 md:px-[3vw] sticky top-0 z-50">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-[#9b87f5] text-sm hover:text-[#7c5ce8] transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">Back to Doctors</span>
        </button>
        <span className="text-[#7c5ce8] font-semibold text-base tracking-tight">
          CuraNova
        </span>
        <div className="w-24" />
      </div>

      {/* profile hero */}
      <div className="w-full bg-white border-b border-gray-100 px-4 md:px-[3vw] py-5 md:py-6">
        <div className="flex items-start gap-4 max-w-6xl mx-auto">
          {/* avatar */}
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-[#ede9fe] flex items-center justify-center text-[#7c5ce8] font-semibold text-xl shrink-0 overflow-hidden">
            {Doctor.profilePicture ? (
              <img
                src={Doctor.profilePicture}
                className="w-full h-full object-cover"
                alt={Doctor.name}
              />
            ) : (
              initials
            )}
          </div>

          {/* info */}
          <div className="flex flex-col gap-1.5 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg md:text-xl font-semibold text-gray-900">
                {Doctor.name}
              </h1>
              {Doctor.isVerified && (
                <div className="flex items-center gap-1 bg-[#ede9fe] text-[#7c5ce8] text-[10px] font-medium px-2 py-0.5 rounded-full">
                  <BadgeCheck size={11} />
                  Verified
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400">
              {Doctor.degrees?.join(", ")}
              {Doctor.experience && ` · ${Doctor.experience} years experience`}
            </p>
            <div className="flex items-center gap-2 flex-wrap mt-0.5">
              <span className="text-xs bg-[#ede9fe] text-[#7c5ce8] px-2.5 py-0.5 rounded-full font-medium">
                {Doctor.department}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <MapPin size={11} />
                {Doctor.hospital_name}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* main content */}
      <div className="max-w-6xl mx-auto px-4 md:px-[3vw] py-5">
        <div className="flex flex-col lg:flex-row gap-5 items-start">
          {/* profile info */}
          <div className="w-full lg:w-[55%] flex flex-col gap-4">
            {/* at a glance */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="text-sm font-medium text-gray-700 mb-3">
                At a glance
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatBox
                  value={Doctor.rating ?? "—"}
                  label={`Rating (${Doctor.rating_count ?? 0})`}
                  sub={<StarRating rating={Doctor.rating ?? 0} />}
                />
                <StatBox
                  value={Doctor.experience ? `${Doctor.experience} yrs` : "—"}
                  label="Experience"
                  sub={<Briefcase size={14} className="text-[#9b87f5]" />}
                />
                <StatBox
                  value={`₹${Doctor.consultation_fee}`}
                  label="Consultation fee"
                  sub={
                    <span className="text-[10px] text-[#9b87f5]">
                      per visit
                    </span>
                  }
                />
                <StatBox
                  value={
                    Doctor.patients_count
                      ? `${(Doctor.patients_count / 1000).toFixed(1)}k+`
                      : "—"
                  }
                  label="Patients seen"
                  sub={<Users size={14} className="text-[#9b87f5]" />}
                />
              </div>
            </div>

            {/* about */}
            {Doctor.bio && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h2 className="text-sm font-medium text-gray-700 mb-2.5">
                  About
                </h2>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {Doctor.bio}
                </p>
              </div>
            )}

            {/* details */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="text-sm font-medium text-gray-700 mb-1">
                Details
              </h2>
              <InfoRow
                icon={MapPin}
                label="Hospital"
                value={Doctor.hospital_name ?? "—"}
              />
              <InfoRow
                icon={Stethoscope}
                label="Department"
                value={Doctor.department ?? "—"}
              />
              <InfoRow
                icon={Clock}
                label="Available"
                value={Doctor.available_days ?? "—"}
              />
              {Doctor.languages?.length > 0 && (
                <InfoRow
                  icon={Languages}
                  label="Languages"
                  value={Doctor.languages.join(", ")}
                />
              )}
              {Doctor.patients_count && (
                <InfoRow
                  icon={Users}
                  label="Patients seen"
                  value={`${Doctor.patients_count.toLocaleString()}+`}
                />
              )}
            </div>
          </div>

          {/* booking widget */}
          <div className="w-full lg:w-[45%] lg:sticky lg:top-[calc(9vh+1.25rem)]">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-5">
              {/* fee header */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-50">
                <span className="text-xs text-gray-400">Consultation fee</span>
                <div className="text-right">
                  <span className="text-2xl font-semibold text-gray-900">
                    ₹{Doctor.consultation_fee}
                  </span>
                  <span className="text-xs text-gray-400 block">per visit</span>
                </div>
              </div>

              {/* date picker */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-3">
                  <CalendarDays size={13} className="text-[#9b87f5]" />
                  Select date
                </div>
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                  {days.map((d) => (
                    <button
                      key={d.fullDate}
                      onClick={() => {
                        setSelectedDay(d.fullDate);
                        setSelectedSlot(null);
                      }}
                      className={`flex flex-col items-center px-3 py-2.5 rounded-xl border text-xs font-medium transition-all duration-150 shrink-0 cursor-pointer min-w-[52px]
                        ${
                          selectedDay === d.fullDate
                            ? "bg-[#7c5ce8] text-white border-[#7c5ce8]"
                            : "bg-[#faf9ff] text-[#7c5ce8] border-[#e0daf7] hover:border-[#9b87f5]"
                        }`}
                    >
                      <span
                        className={`text-[9px] font-normal mb-0.5 ${selectedDay === d.fullDate ? "opacity-75" : "opacity-60"}`}
                      >
                        {d.label.split(" ")[0]}
                      </span>
                      <span>
                        {d.label.includes(" ")
                          ? d.label.split(" ")[1]
                          : d.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* slots */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-3">
                  <Clock size={13} className="text-[#9b87f5]" />
                  Available slots
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {ALL_SLOTS.map((slot) => {
                    const taken = takenSlots.includes(slot);
                    const active = selectedSlot === slot;
                    return (
                      <button
                        key={slot}
                        disabled={taken}
                        onClick={() => setSelectedSlot(slot)}
                        className={`text-[11px] text-center py-2.5 rounded-xl border transition-all duration-150
                          ${
                            taken
                              ? "border-gray-100 text-gray-300 bg-gray-50 line-through cursor-not-allowed"
                              : active
                                ? "bg-[#7c5ce8] text-white border-[#7c5ce8] font-medium scale-[1.02] cursor-pointer"
                                : "bg-[#faf9ff] text-[#7c5ce8] border-[#e0daf7] hover:border-[#9b87f5] cursor-pointer"
                          }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* legend */}
              <div className="flex items-center gap-4 text-[10px] text-gray-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#ede9fe] inline-block" />
                  Available
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#7c5ce8] inline-block" />
                  Selected
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-gray-100 inline-block" />
                  Taken
                </span>
              </div>

              {/* confirm button */}
              <button
                disabled={!selectedSlot}
                // TODO: wire booking API call here
                className={`w-full py-3.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${
                    selectedSlot
                      ? "bg-[#7c5ce8] hover:bg-[#9b87f5] text-white cursor-pointer"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
              >
                {selectedSlot
                  ? `Confirm booking — ₹${Doctor.consultation_fee}`
                  : "Select a slot to continue"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
