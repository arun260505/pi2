const db = require("../models/db");

// Save media info to DB
exports.saveMedia = (req, res) => {
  const { displayId, type } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const fileUrl = `/uploads/${req.file.filename}`;

  const sql =
    "INSERT INTO media (display_id, file_url, type) VALUES (?, ?, ?)";

  db.query(sql, [displayId, fileUrl, type], (err, result) => {
    if (err) return res.status(500).send(err);

    res.json({
      message: "Media uploaded successfully",
      media: {
        id: result.insertId,
        displayId,
        type,
        url: fileUrl
      }
    });
  });
};
