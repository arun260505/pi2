const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const authRoutes = require("./routes/authRoutes");

const db = require("./models/db");
const displayRoutes = require("./routes/displayRoutes");
const mediaRoutes = require("./routes/mediaRoutes");

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: { origin: "*" }
});

// Middlewares
app.use(cors());
app.use(express.json());

// Make io available in controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});


// Routes
app.use("/api/display", displayRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/auth", authRoutes);

// Static uploads
app.use("/uploads", express.static("src/uploads"));

// Health check
app.get("/", (req, res) => {
  res.send("PiSignage Backend Running");
});

// 🔥 CORRECT REAL-TIME LOGIC (PAIRING-CODE BASED)
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // TV joins using pairing code
  socket.on("join-tv", (pairingCode) => {
    socket.join(pairingCode);
    console.log(`TV joined room: ${pairingCode}`);
  });

  // Client sends media using pairing code
  socket.on("send-media", ({ pairingCode, media }) => {
    io.to(pairingCode).emit("play-media", media);
    console.log(`Media sent to TV with code ${pairingCode}`);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// Auth routes


// Start server
server.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});
