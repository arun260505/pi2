// backend/src/controllers/mediaController.js

const uploadMedia = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  res.json({
    message: "Upload successful",
    media: {
      url: `/uploads/${req.file.filename}`,
      type: req.body.type
    }
  });
};

module.exports = {
  uploadMedia
};