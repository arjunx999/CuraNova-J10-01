import e from "express";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

export function uploadToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "CuraNova" },
      (err, result) => {
        if (result) resolve(result);
        else reject(err);
      },
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}
