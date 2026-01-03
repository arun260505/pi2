const express = require("express");
const router = express.Router();
const db = require("../models/db");

/**
 * GET playlists by user
 * /api/playlists?userId=1
 */
router.get("/", (req, res) => {
  const { userId } = req.query;

  db.query(
    "SELECT * FROM playlists WHERE user_id = ?",
    [userId],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json(err);
      }
      res.json(results);
    }
  );
});

/**
 * CREATE playlist
 */
router.post("/", (req, res) => {
  const { name, userId } = req.body;

  db.query(
    "INSERT INTO playlists (name, user_id) VALUES (?, ?)",
    [name, userId],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json(err);
      }

      res.json({
        id: result.insertId,
        name,
        user_id: userId
      });
    }
  );
});

/**
 * GET assets in playlist (WITH ticker + layout)
 */
router.get("/:playlistId/assets", (req, res) => {
  const { playlistId } = req.params;

  db.query(
    `
    SELECT 
      a.*,
      pa.duration,
      pa.sort_order,
      p.ticker_config,
      p.layout
    FROM playlist_assets pa
    JOIN assets a ON a.id = pa.asset_id
    JOIN playlists p ON p.id = pa.playlist_id
    WHERE pa.playlist_id = ?
    ORDER BY pa.sort_order ASC
    `,
    [playlistId],
    (err, results) => {
      if (err) return res.status(500).json(err);

      const tickerConfig = results[0]?.ticker_config || null;
      const layout = results[0]?.layout || "landscape";

      res.json({
        assets: results,
        tickerConfig,
        layout
      });
    }
  );
});

/**
 * ADD assets to playlist
 */
router.post("/:playlistId/assets", (req, res) => {
  const { playlistId } = req.params;
  const { assetIds } = req.body;

  if (!Array.isArray(assetIds) || !assetIds.length) {
    return res.status(400).json({ message: "No assets provided" });
  }

  const values = assetIds.map((id) => [playlistId, id]);

  db.query(
    "INSERT INTO playlist_assets (playlist_id, asset_id) VALUES ?",
    [values],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json(err);
      }
      res.json({ success: true });
    }
  );
});

/**
 * REMOVE asset from playlist
 */
router.delete("/:playlistId/assets/:assetId", (req, res) => {
  const { playlistId, assetId } = req.params;

  db.query(
    "DELETE FROM playlist_assets WHERE playlist_id = ? AND asset_id = ?",
    [playlistId, assetId],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ success: true });
    }
  );
});

/**
 * DELETE playlist
 */
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.query(
    "DELETE FROM playlists WHERE id = ?",
    [id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ success: true });
    }
  );
});

/**
 * UPDATE asset duration / order
 */
router.put("/:playlistId/assets/:assetId", (req, res) => {
  const { playlistId, assetId } = req.params;
  const { duration, sort_order } = req.body;

  db.query(
    "UPDATE playlist_assets SET duration=?, sort_order=? WHERE playlist_id=? AND asset_id=?",
    [duration, sort_order, playlistId, assetId],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ success: true });
    }
  );
});

/**
 * SAVE PLAYLIST ORDER (drag & drop)
 */
router.put("/:playlistId/order", (req, res) => {
  const { playlistId } = req.params;
  const { orderedIds } = req.body;

  if (!Array.isArray(orderedIds)) {
    return res.status(400).json({ message: "orderedIds required" });
  }

  const updates = orderedIds.map((assetId, index) => {
    return new Promise((resolve, reject) => {
      db.query(
        "UPDATE playlist_assets SET sort_order=? WHERE playlist_id=? AND asset_id=?",
        [index, playlistId, assetId],
        (err) => (err ? reject(err) : resolve())
      );
    });
  });

  Promise.all(updates)
    .then(() => res.json({ success: true }))
    .catch((err) => res.status(500).json(err));
});

/**
 * SAVE TICKER CONFIG
 */
router.put("/:playlistId/ticker", (req, res) => {
  const { playlistId } = req.params;
  const { tickerConfig } = req.body;

  db.query(
    "UPDATE playlists SET ticker_config=? WHERE id=?",
    [
      typeof tickerConfig === "string"
        ? tickerConfig
        : JSON.stringify(tickerConfig),
      playlistId
    ],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ success: true });
    }
  );
});

/**
 * SAVE PLAYLIST LAYOUT
 */
router.put("/:playlistId/layout", (req, res) => {
  const { playlistId } = req.params;
  const { layout } = req.body;

  if (!["landscape", "portrait"].includes(layout)) {
    return res.status(400).json({ message: "Invalid layout" });
  }

  db.query(
    "UPDATE playlists SET layout=? WHERE id=?",
    [layout, playlistId],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ success: true });
    }
  );
});

module.exports = router;