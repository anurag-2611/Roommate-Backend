import multer from "multer";
import fs from "fs";
import path from "path";

const UPLOAD_DIR = path.resolve(process.cwd(), "public");

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  try {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  } catch (err) {
    console.error("Failed to create upload directory:", err);
  }
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },

  filename: function (req, file, cb) {
    // prefix with timestamp to avoid collisions
    const name = `${Date.now()}-${file.originalname}`;
    cb(null, name);
  },
});

export const upload = multer({ storage });
