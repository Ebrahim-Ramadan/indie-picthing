import { writeAsyncIterableToWritable } from "@remix-run/node";
import type { UploadHandler } from "@remix-run/node";
import { createWriteStream } from "fs";
import { mkdir } from "fs/promises";
import path from "path";

export const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");



export const uploadHandler: UploadHandler = async ({ name, contentType, data, filename }) => {
  if (name !== "image") {
    return undefined;
  }

  if (!filename) {
    return undefined;
  }

  const extension = path.extname(filename).toLowerCase();
  const allowedExtensions = [".png", ".jpg", ".jpeg", ".gif", ".webp"];
  if (!allowedExtensions.includes(extension)) {
    return undefined;
  }

  // Additional content type validation (optional)
  const allowedContentTypes = ["image/png", "image/jpeg", "image/gif", "image/webp"];
  if (!allowedContentTypes.includes(contentType || "")) {
    return undefined;
  }

  try {
    // Ensure the upload directory exists
    await mkdir(UPLOAD_DIR, { recursive: true });

    const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${extension}`;
    const filePath = path.join(UPLOAD_DIR, uniqueFilename);

    // Write the file to the server
    await writeAsyncIterableToWritable(data, createWriteStream(filePath));

    // Return the public URL of the uploaded file
    return `/uploads/${uniqueFilename}`;
  } catch (error) {
    console.error("Error uploading file:", error);
    return undefined;
  }
};