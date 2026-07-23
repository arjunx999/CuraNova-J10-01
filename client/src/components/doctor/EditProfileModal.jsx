import { useState } from "react";
import { X } from "lucide-react";
import axios from "../../api/axios";
import toast from "react-hot-toast";

const EditProfileModal = ({ doctor, close, updateDoctor }) => {
  const [formData, setFormData] = useState({
    degrees: doctor?.degrees?.join(", ") || "",

    hospital_name: doctor?.hospital_name || "",

    department: doctor?.department || "",

    about: doctor?.about || "",

    consultation_fee: doctor?.consultation_fee || "",
  });

  const departments = [
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.put("/doctor/update-profile", formData);

      updateDoctor(res.data.doctor);

      toast.success("Profile updated");

      close();
    } catch (error) {
      console.log(error);

      toast.error("Failed to update profile");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-xl rounded-3xl p-6 shadow-xl">
        {/* Header */}

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Edit profile</h2>

          <button
            onClick={close}
            className="text-gray-400 hover:text-gray-700 transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Degrees</label>

            <input
              name="degrees"
              value={formData.degrees}
              onChange={handleChange}
              placeholder="MBBS, MD"
              className="w-full px-3 py-2 text-sm rounded-lg bg-[#f8f8f8] border border-[#e6e6e6] focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">
              Department
            </label>

            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-lg bg-[#f8f8f8] border border-[#e6e6e6] focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition text-gray-500"
            >
              <option value="" disabled>
                Select dept.
              </option>

              {departments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">
              Hospital Name
            </label>

            <input
              name="hospital_name"
              value={formData.hospital_name}
              onChange={handleChange}
              placeholder="City Hospital"
              className="w-full px-3 py-2 text-sm rounded-lg bg-[#f8f8f8] border border-[#e6e6e6] focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">
              Consultation Fee (₹)
            </label>

            <input
              type="number"
              name="consultation_fee"
              value={formData.consultation_fee}
              onChange={handleChange}
              placeholder="500"
              className="w-full px-3 py-2 text-sm rounded-lg bg-[#f8f8f8] border border-[#e6e6e6] focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">About</label>

            <textarea
              name="about"
              value={formData.about}
              onChange={handleChange}
              placeholder="Brief bio — specialization, experience, approach..."
              rows={3}
              className="w-full px-3 py-3 text-sm rounded-lg bg-[#f8f8f8] border border-[#e6e6e6] focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition resize-none"
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-[#7c5ce8] hover:bg-[#9b87f5] text-white py-3 rounded-lg transition font-medium text-sm"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
