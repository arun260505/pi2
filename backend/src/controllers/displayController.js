const db = require("../models/db");
const { v4: uuid } = require("uuid");
const geoip = require("geoip-lite");

// Generate 6-character pairing code
const generateCode = () => {
  return uuid().slice(0, 6).toUpperCase();
};

// TV registers itself
const registerDisplay = (req, res) => {
  const code = generateCode();
  console.log("REGISTER DISPLAY HIT");
  console.log("Generated code:", code);
  const sql = "INSERT INTO displays (pairing_code) VALUES (?)";
  db.query(sql, [code], (err, result) => {
    if (err) return res.status(500).send(err);

    res.json({
      displayId: result.insertId,
      pairingCode: code
    });
  });
};

// Client pairs with TV using code
const pairDisplay = (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ message: "Pairing code required" });
  }

  const sql =
    "SELECT * FROM displays WHERE pairing_code = ? AND is_paired = false";

  db.query(sql, [code], (err, results) => {
    if (err) return res.status(500).send(err);

    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "Invalid or already used code" });
    }

    const displayId = results[0].id;

    db.query(
      "UPDATE displays SET is_paired = true WHERE id = ?",
      [displayId],
      () => {
        req.io.to(code).emit("tv-paired");

        res.json({
          message: "TV paired successfully",
          displayId
        });
      }
    );
  });
};

const getPlayers = (req, res) => {
  const { userId } = req.query;

  const sql = `
  SELECT 
      d.*,
      p.name AS current_playlist_name
    FROM displays d
    LEFT JOIN playlists p 
      ON d.current_playlist_id = p.id
    WHERE d.user_id = ?
    `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json([]);
    }
    res.json(results);
  });
};

// REGISTER PLAYER
const registerPlayer = (req, res) => {
  const { pairingCode, name, timezone, group, userId } = req.body;

  // 🌍 AUTO LOCATION (unchanged)
  const ip =
    req.headers["x-forwarded-for"] ||
    req.socket.remoteAddress;

  const geo = geoip.lookup(ip);

  const location = geo
    ? `${geo.city || "Unknown"}, ${geo.country || ""}`
    : "Unknown";

  // 🔍 STEP 1: CHECK PAIRING STATUS
  const checkSql =
    "SELECT is_paired FROM displays WHERE pairing_code = ?";

  db.query(checkSql, [pairingCode], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "DB error" });
    }

    if (rows.length === 0) {
      return res.status(400).json({ message: "Invalid TV code" });
    }

    // 🔒 BLOCK IF ALREADY PAIRED
    if (rows[0].is_paired === 1) {
      return res
        .status(400)
        .json({ message: "Player already registered" });
    }

    // ✅ STEP 2: REGISTER PLAYER
    const updateSql = `
      UPDATE displays
      SET 
        name = ?,
        location = ?,
        timezone = ?,
        group_name = ?,
        is_paired = 1,
        user_id = ?
      WHERE pairing_code = ?
    `;

    db.query(
      updateSql,
      [name, location, timezone, group, userId, pairingCode],
      (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "DB error" });
        }

        res.json({ message: "Player registered successfully" });
      }
    );
  });
};





// unregisterPlayer 
// UNREGISTER PLAYER
const unregisterPlayer = (req, res) => {
  const { id } = req.params;

  const sql = `
    UPDATE displays
    SET
      user_id = NULL,
      is_paired = 0,
      name = NULL,
      location = NULL,
      group_name = NULL,
      timezone = NULL
    WHERE id = ?
  `;

  db.query(sql, [id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "DB error" });
    }

    res.json({ message: "Player unregistered successfully" });
  });
};
module.exports = {
  registerDisplay,
  pairDisplay,
  getPlayers,
  registerPlayer,
  unregisterPlayer
};