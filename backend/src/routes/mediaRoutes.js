const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const { uploadMedia } = require("../controllers/mediaController");

// Multer config
const storage = multer.diskStorage({
  destination: "src/uploads",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Upload API
router.post("/upload", upload.single("file"), uploadMedia);

module.exports = router;