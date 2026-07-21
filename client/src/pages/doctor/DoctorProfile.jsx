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
import logo from "../../assets/logo.png";
import Navbar from "../../components/Navbar";

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
    <div className="w-screen min-h-screen overflow-x-hidden bg-[#f5f4f0] relative flex flex-col">
      {/* Background */}
      <div className="w-full h-full absolute top-0 left-0 blob1 z-0 opacity-50" />
      <div className="w-[50%] h-[50%] absolute top-25 -left-35 blob2 z-0 opacity-40" />

      {/* Navbar */}
      <Navbar />

      {/* Page Content */}
      <main className="relative z-10 flex-1 w-full px-6 lg:px-12 py-8">
        <div className="max-w-[1400px] mx-auto">
          {/* Back */}
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 mb-8 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-[#7c5ce8] hover:bg-purple-50 transition-all"
          >
            <ArrowLeft size={18} />
          </button>

          {/* Doctor Header */}
          <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center gap-5 mb-6">
            <div className="w-24 h-24 rounded-2xl bg-[#ede9fe] flex items-center justify-center text-[#7c5ce8] text-3xl font-semibold">
              {initials}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold text-gray-900">
                  {Doctor.name}
                </h1>

                {Doctor.isVerified && (
                  <BadgeCheck
                    size={18}
                    className="text-[#9b87f5] fill-[#ede9fe]"
                  />
                )}
              </div>

              <p className="text-sm text-gray-400 mt-1">
                {Doctor.degrees.join(", ")} • {Doctor.experience} years
                experience  
              </p>

              <div className="flex gap-3 mt-3">
                <span className="px-3 py-1 rounded-full bg-[#f3edff] text-[#7c5ce8] text-xs">
                  {Doctor.department}
                </span>

                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <MapPin size={12} />
                  {Doctor.hospital_name}
                </span>
              </div>
            </div>
          </section>

          {/* Main Grid */}
          <div className="grid grid-cols-12 gap-6">
            {/* LEFT */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              {/* Stats */}
              <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-sm font-medium text-gray-700 mb-5">
                  At a glance
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatBox
                    value={Doctor.rating}
                    label="Rating"
                    sub={<StarRating rating={Doctor.rating} />}
                  />

                  <StatBox
                    value={`${Doctor.experience} yrs`}
                    label="Experience"
                    sub={<Briefcase size={14} className="text-[#9b87f5]" />}
                  />

                  <StatBox
                    value={`₹${Doctor.consultation_fee}`}
                    label="Consultation fee"
                    sub={
                      <span className="text-[10px] text-gray-400">
                        per visit
                      </span>
                    }
                  />

                  <StatBox
                    value={`${Doctor.patients_count}+`}
                    label="Patients seen"
                    sub={<Users size={14} className="text-[#9b87f5]" />}
                  />
                </div>
              </section>

              {/* About */}
              <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h2 className="font-medium text-gray-800 mb-3">About</h2>

                <p className="text-sm text-gray-500 leading-relaxed">
                  {Doctor.bio}
                </p>
              </section>

              {/* Details */}
              <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h2 className="font-medium text-gray-800 mb-3">Details</h2>

                <InfoRow
                  icon={MapPin}
                  label="Hospital"
                  value={Doctor.hospital_name}
                />

                <InfoRow
                  icon={Stethoscope}
                  label="Department"
                  value={Doctor.department}
                />

                <InfoRow
                  icon={Clock}
                  label="Available"
                  value={Doctor.available_days}
                />

                <InfoRow
                  icon={Languages}
                  label="Languages"
                  value={Doctor.languages.join(", ")}
                />

                <InfoRow
                  icon={Users}
                  label="Patients seen"
                  value={`${Doctor.patients_count}+`}
                />
              </section>
            </div>

            {/* RIGHT BOOKING PANEL */}
            <aside className="col-span-12 lg:col-span-4">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-6">
                <div className="flex justify-between mb-6">
                  <span className="text-sm text-gray-400">
                    Consultation fee
                  </span>

                  <div className="text-right">
                    <p className="text-3xl font-semibold">
                      ₹{Doctor.consultation_fee}
                    </p>

                    <span className="text-xs text-gray-400">per visit</span>
                  </div>
                </div>

                {/* Date Selector */}

                <div className="flex items-center gap-2 text-sm mb-4 text-gray-600">
                  <CalendarDays size={15} className="text-[#9b87f5]" />
                  Select date
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-6">
                  {days.map((day, index) => (
                    <button
                      key={day.fullDate}
                      onClick={() => setSelectedDay(day.fullDate)}
                      className={`min-w-[62px] h-[48px] rounded-xl border flex flex-col items-center justify-center transition-all
        ${
          selectedDay === day.fullDate
            ? "bg-[#7c5ce8] border-[#7c5ce8] text-white shadow-md shadow-purple-200"
            : "bg-white border-purple-100 text-gray-500 hover:border-purple-300"
        }
      `}
                    >
                      <span className="text-[10px] opacity-80">
                        {index === 0 ? "Today" : day.label.split(" ")[0]}
                      </span>

                      <span className="text-sm font-medium">
                        {index === 0 ? "Today" : day.label.split(" ")[1]}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Slots */}

                <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                  <Clock size={14} className="text-[#9b87f5]" />
                  Available slots
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {ALL_SLOTS.map((slot) => {
                    const disabled = takenSlots.includes(slot);

                    return (
                      <button
                        key={slot}
                        disabled={disabled}
                        onClick={() => setSelectedSlot(slot)}
                        className={`h-[38px] rounded-xl border text-xs transition-all
          ${
            disabled
              ? "bg-gray-50 text-gray-300 border-gray-100 line-through"
              : selectedSlot === slot
                ? "bg-[#7c5ce8] text-white border-[#7c5ce8]"
                : "bg-white border-purple-100 text-[#7c5ce8] hover:bg-purple-50"
          }
        `}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}

                <div className="flex items-center gap-5 mt-5 text-[11px] text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-100" />
                    Available
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#7c5ce8]" />
                    Selected
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-gray-200" />
                    Taken
                  </div>
                </div>

                <button
                  disabled={!selectedSlot}
                  className="w-full mt-6 py-4 rounded-xl bg-[#7c5ce8] text-white disabled:bg-gray-200"
                >
                  {selectedSlot ? "Continue" : "Select a slot to continue"}
                </button>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DoctorProfile;
