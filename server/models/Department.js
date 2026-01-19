import mongoose from "mongoose";

const departmentSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  doctors: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
    },
  ],
});

export const Department = mongoose.model("Department", departmentSchema);
