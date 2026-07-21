import React, { useState, useEffect, useRef } from "react";
import { Search, Star, BadgeCheck } from "lucide-react";
import logo from "../../assets/logo.png";
import axios from "../../api/axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../../components/Navbar";

const departments = [
  "All",
  "General Medicine",
  "Cardiology",
  "Dermatology",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
  "Gynecology",
  "ENT",
  "Ophthalmology",
  "Urology",
  "Oncology",
  "Radiology",
  "Anesthesiology",
  "Emergency Medicine",
];

const sortOptions = [
  { label: "Rating", value: "rating" },
  { label: "Fee: Low to High", value: "fee_asc" },
  { label: "Fee: High to Low", value: "fee_desc" },
];

const DoctorCard = ({ doctor }) => {
  const initials = doctor.name
    .replace("Dr. ", "")
    .split(" ")
    .map((n) => n[0])
    .join("");

  const slotBadge = () => {
    if (doctor.slotsToday > 1)
      return (
        <span className="text-xs text-[#7c5ce8] font-medium">
          ● {doctor.slotsToday} slots available today
        </span>
      );
    if (doctor.slotsToday === 1)
      return (
        <span className="text-xs text-amber-500 font-medium">
          ● 1 slot left today
        </span>
      );
    return <span className="text-xs text-gray-400">● No slots today</span>;
  };

  const Navigate = useNavigate();

  return (
    <div
      onClick={() => Navigate(`/patient/doctor/${doctor._id}`)}
      className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4 
  transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#9b87f5]/10 hover:border-[#e0daf7] cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <div className="w-14 h-14 rounded-xl bg-[#ede9fe] flex items-center justify-center text-[#7c5ce8] font-semibold text-base shrink-0 overflow-hidden">
          {doctor.profilePicture ? (
            <img
              src={doctor.profilePicture}
              className="w-full h-full object-cover"
              alt=""
            />
          ) : (
            initials
          )}
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-gray-900 truncate">
              {doctor.name}
            </span>
            {doctor.isVerified && (
              <BadgeCheck size={15} className="text-[#7c5ce8] shrink-0" />
            )}
          </div>
          <span className="text-xs text-gray-400 truncate">
            {doctor.degrees.join(", ")}
          </span>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs bg-[#ede9fe] text-[#7c5ce8] px-2.5 py-0.5 rounded-full font-medium whitespace-nowrap">
              {doctor.department}
            </span>
            <span className="text-xs text-gray-400 truncate">
              {doctor.hospital_name}
            </span>
          </div>
        </div>
      </div>
      <div className="h-px bg-gray-100"></div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              size={12}
              className={
                s <= Math.round(doctor.rating)
                  ? "text-[#9b87f5] fill-[#9b87f5]"
                  : "text-gray-200 fill-gray-200"
              }
            />
          ))}
          <span className="text-xs font-medium text-gray-700 ml-1">
            {doctor.rating}
          </span>
          <span className="text-xs text-gray-400">({doctor.rating_count})</span>
        </div>
        <div className="text-right">
          <span className="text-sm font-semibold text-gray-900">
            ₹{doctor.consultation_fee}
          </span>
          <span className="text-xs text-gray-400 block">per consult</span>
        </div>
      </div>
      {slotBadge()}
      {doctor.slotsToday > 0 ? (
        <button className="w-full py-2.5 bg-[#7c5ce8] hover:bg-[#9b87f5] transition-colors duration-200 text-white text-sm font-medium rounded-xl cursor-pointer">
          Book appointment
        </button>
      ) : (
        <button className="w-full py-2.5 bg-white border border-[#9b87f5] text-[#7c5ce8] hover:bg-[#ede9fe] transition-colors duration-200 text-sm font-medium rounded-xl cursor-pointer">
          View availability
        </button>
      )}
    </div>
  );
};

const PatientHome = () => {
  const [activeDept, setActiveDept] = useState("All");
  const [activeSort, setActiveSort] = useState("rating");
  const [availableToday, setAvailableToday] = useState(false);
  const [search, setSearch] = useState("");
  const [doctors, setDoctors] = useState([]);
  const Navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get("/doctor/get-doctors", {
          params: {
            department: activeDept,
            sort: activeSort,
            available_today: availableToday,
          },
        });
        setDoctors(res.data.doctors);
        // console.log(res);
      } catch (error) {
        console.log(error);
      }
    };
    fetchDoctors();
  }, [activeDept, activeSort, availableToday]);

  const filteredDoctors = doctors.filter((doc) =>
    search.trim() === ""
      ? true
      : doc.name.toLowerCase().includes(search.toLowerCase()) ||
        doc.department.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="w-screen min-h-screen overflow-x-hidden bg-[#f5f4f0] relative flex flex-col">
      <div className="w-full h-full absolute top-0 left-0 blob1 z-0 opacity-50"></div>
      <div className="w-[50%] h-[50%] absolute top-25 -left-35 blob2 z-0 opacity-40"></div>

      {/* navbar */}
      <Navbar />

      {/* hero */}
      <div className="w-full flex flex-col items-center text-center px-4 sm:px-[4vw] pt-6 pb-5 z-10">
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#ede9fe] text-[#7c5ce8] text-xs font-medium rounded-full mb-4">
          <span className="text-[#9b87f5]">✓</span>
          2,400+ verified doctors
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-gray-900 leading-tight mb-3">
          Find the right doctor,
          <br />
          book in minutes.
        </h1>
        <p className="text-gray-400 text-sm md:text-base mb-6 max-w-xs sm:max-w-none">
          Search by name, specialty, or condition — same-day slots available.
        </p>

        {/* search bar */}
        <div className="flex items-center gap-2 sm:gap-3 bg-white rounded-full px-4 sm:px-5 py-2.5 sm:py-3 border border-[#e0daf7] w-full max-w-2xl shadow-sm">
          <Search size={15} className="text-[#9b87f5] shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search doctor or specialty..."
            className="flex-1 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 outline-none min-w-0"
          />
          <button className="bg-[#7c5ce8] hover:bg-[#9b87f5] transition-colors duration-200 text-white text-xs sm:text-sm px-3 sm:px-5 py-1.5 sm:py-2 rounded-full shrink-0 cursor-pointer">
            Search
          </button>
        </div>

        {/* stats */}
        <div className="flex items-center gap-6 sm:gap-10 mt-5">
          <div className="flex flex-col items-center">
            <span className="text-lg sm:text-xl font-semibold text-[#7c5ce8]">
              2,400+
            </span>
            <span className="text-xs text-gray-400 mt-0.5">Doctors</span>
          </div>
          <div className="w-px h-8 bg-gray-200"></div>
          <div className="flex flex-col items-center">
            <span className="text-lg sm:text-xl font-semibold text-[#7c5ce8]">
              48
            </span>
            <span className="text-xs text-gray-400 mt-0.5">Specialties</span>
          </div>
          <div className="w-px h-8 bg-gray-200"></div>
          <div className="flex flex-col items-center gap-0.5">
            <div className="flex items-center gap-1">
              <span className="text-lg sm:text-xl font-semibold text-[#7c5ce8]">
                4.8
              </span>
              <Star size={13} className="text-[#9b87f5] fill-[#9b87f5]" />
            </div>
            <span className="text-xs text-gray-400">Avg rating</span>
          </div>
        </div>
      </div>

      {/* browse section */}
      <div className="px-4 sm:px-[4vw] md:px-[3vw] z-10 flex flex-col gap-3">
        <span className="text-sm font-medium text-gray-700">
          Browse by specialty
        </span>

        {/* department chips — already scrollable, fine */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 w-full">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setActiveDept(dept)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap border transition-all duration-200 cursor-pointer shrink-0
                ${
                  activeDept === dept
                    ? "bg-[#7c5ce8] text-white border-[#7c5ce8] font-medium"
                    : "bg-white text-gray-500 border-gray-200 hover:border-[#9b87f5] hover:text-[#7c5ce8]"
                }`}
            >
              {dept}
            </button>
          ))}
        </div>

        {/* filters row — stacks on mobile */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-1">
          <span className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-medium text-gray-700">
              {filteredDoctors.length} doctors
            </span>
          </span>
          {/* sort + available chips — scrollable on mobile */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
            <button
              onClick={() => setAvailableToday((prev) => !prev)}
              className={`px-4 py-1.5 rounded-full text-xs border transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0
                ${
                  availableToday
                    ? "bg-[#ede9fe] text-[#7c5ce8] border-[#9b87f5] font-medium"
                    : "bg-white text-gray-500 border-gray-200 hover:border-[#9b87f5] hover:text-[#7c5ce8]"
                }`}
            >
              ● Available today
            </button>
            {sortOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setActiveSort(opt.value)}
                className={`px-4 py-1.5 rounded-full text-xs border transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0
                  ${
                    activeSort === opt.value
                      ? "bg-[#ede9fe] text-[#7c5ce8] border-[#9b87f5] font-medium"
                      : "bg-white text-gray-500 border-gray-200 hover:border-[#9b87f5] hover:text-[#7c5ce8]"
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* cards grid */}
      <div className="px-4 sm:px-[4vw] md:px-[3vw] py-5 z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDoctors.map((doctor) => (
            <DoctorCard key={doctor._id} doctor={doctor} />
          ))}
        </div>
      </div>

      {/* footer */}
      <div className="w-[95%] h-[0.5px] bg-[#6d4fc9] mt-10 md:mt-15 mx-auto shadow-[0_10px_60px_rgba(0,0,0,0.07)]"></div>

      <div className="w-full px-4 sm:px-6 md:px-10 my-6 md:my-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left Text */}
        <h1 className="text-xs sm:text-sm text-gray-400 text-center sm:text-left">
          CuraNova@2025
        </h1>

        {/* Icons */}
        <div className="flex items-center gap-4">
          {/* GitHub */}
          <a
            href="https://github.com/arjunx999/"
            className="text-gray-400 hover:text-gray-700 transition-colors duration-200"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.34-3.369-1.34-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
          </a>

          {/* LinkedIn */}
          <a
            href="https://www.linkedin.com/in/arjun-verma-5b4326292/"
            className="text-gray-400 hover:text-[#0077b5] transition-colors duration-200"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default PatientHome;
