const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "arun123",     // put your MySQL password here
  database: "pi",
  //socketPath: "/tmp/mysql.sock"
});

db.connect((err) => {
  if (err) {
    console.error("MySQL connection failed:", err);
  } else {
    console.log("MySQL connected successfully");
  }
});

module.exports = db;
