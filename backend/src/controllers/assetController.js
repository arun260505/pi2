const db = require("../models/db");
const fs = require("fs");
const path = require("path");

/* =========================
   UPLOAD ASSET (UNCHANGED LOGIC)
========================= */
exports.uploadAsset = (req, res) => {
  const { userId } = req.body;

  if (!req.file || !userId) {
    return res.status(400).json({ message: "Missing file or userId" });
  }

  const type = req.file.mimetype.startsWith("video")
    ? "video"
    : "image";

  const sql = `
    INSERT INTO assets (user_id, file_name, file_path, file_type, file_size)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      userId,
      req.file.originalname,
      `/uploads/${req.file.filename}`,
      type,
      req.file.size
    ],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "DB error" });
      }

      res.json({ message: "Asset uploaded" });
    }
  );
};

/* =========================
   GET ASSETS (FIXED ORDER BY)
========================= */
exports.getAssets = (req, res) => {
  const { userId } = req.query;

  db.query(
    "SELECT * FROM assets WHERE user_id = ? ORDER BY id DESC",
    [userId],
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json([]);
      }
      res.json(rows);
    }
  );
};

/* =========================
   DELETE ASSET (NEW – REQUIRED)
========================= */
exports.deleteAsset = (req, res) => {
  const { id } = req.params;

  db.query(
    "SELECT file_path FROM assets WHERE id = ?",
    [id],
    (err, rows) => {
      if (err || rows.length === 0) {
        return res.status(404).json({ message: "Asset not found" });
      }

      const filePath = path.join(__dirname, "..", rows[0].file_path);

      fs.unlink(filePath, () => {
        db.query(
          "DELETE FROM assets WHERE id = ?",
          [id],
          () => res.json({ message: "Asset deleted" })
        );
      });
    }
  );
};