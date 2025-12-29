const db = require("../models/db");
const bcrypt = require("bcryptjs");

// SIGNUP
exports.signup = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  const hash = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO users (username, password) VALUES (?, ?)",
    [username, hash],
    (err) => {
      if (err) {
        return res.status(400).json({ message: "User already exists" });
      }
      res.json({ message: "Signup successful" });
    }
  );
};

// LOGIN
exports.login = (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, rows) => {
      if (rows.length === 0) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const user = rows[0];
      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      res.json({
        userId: user.id,
        username: user.username
      });
    }
  );
};