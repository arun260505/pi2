const express = require("express");
const router = express.Router();
const displayController = require("../controllers/displayController");

// TV generates pairing code
router.post("/register", displayController.registerDisplay);

// Client enters pairing code
router.post("/pair", displayController.pairDisplay);

// Players (user scoped)
router.get("/players", displayController.getPlayers);

// Register player (bind TV to user)
router.post("/register-player", displayController.registerPlayer);

// Unregister player
router.delete("/unregister/:id", displayController.unregisterPlayer);

module.exports = router;