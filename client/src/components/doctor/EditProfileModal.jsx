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

  const departments = ["General Medicine", "Cardiology", "Dermatology", "Neurology", "Orthopedics", "Pediatrics", "Psychiatry", "Gynecology", "ENT", "Ophthalmology", "Urology", "Oncology", "Radiology", "Anesthesiology", "Emergency Medicine"];

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-xl">
        {/* Header */}

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Edit profile</h2>

          <button onClick={close} className="text-gray-400 transition hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-gray-500">Degrees</label>

            <input name="degrees" value={formData.degrees} onChange={handleChange} placeholder="MBBS, MD" className="w-full rounded-lg border border-[#e6e6e6] bg-[#f8f8f8] px-3 py-2 text-sm transition outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200" />
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-500">Department</label>

            <select name="department" value={formData.department} onChange={handleChange} className="w-full rounded-lg border border-[#e6e6e6] bg-[#f8f8f8] px-3 py-2 text-sm text-gray-500 transition outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200">
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
            <label className="mb-1 block text-xs text-gray-500">Hospital Name</label>

            <input name="hospital_name" value={formData.hospital_name} onChange={handleChange} placeholder="City Hospital" className="w-full rounded-lg border border-[#e6e6e6] bg-[#f8f8f8] px-3 py-2 text-sm transition outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200" />
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-500">Consultation Fee (₹)</label>

            <input
              type="number"
              name="consultation_fee"
              value={formData.consultation_fee}
              onChange={handleChange}
              placeholder="500"
              className="w-full rounded-lg border border-[#e6e6e6] bg-[#f8f8f8] px-3 py-2 text-sm transition outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-500">About</label>

            <textarea
              name="about"
              value={formData.about}
              onChange={handleChange}
              placeholder="Brief bio — specialization, experience, approach..."
              rows={3}
              className="w-full resize-none rounded-lg border border-[#e6e6e6] bg-[#f8f8f8] px-3 py-3 text-sm transition outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
            />
          </div>

          <button onClick={handleSubmit} className="w-full rounded-lg bg-[#7c5ce8] py-3 text-sm font-medium text-white transition hover:bg-[#9b87f5]">
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
