const express = require("express");
const path = require("path");
require("dotenv").config();

const viewRoutes = require("./routes/views");
const apiRoutes = require("./routes/api");

const app = express();

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../public/views"));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));

// Routes
app.use("/", viewRoutes);
app.use("/api", apiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// Add here the routes to the different views
app.get("/projects", (req, res) => {
  res.render("projects");
});

module.exports = app;
