const express = require("express");
const cors = require("cors");
require("./db.config");
const router = require("./router.config");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use your API routes
app.use(router);

// 404 handler
app.use((req, res, next) => {
  next({ status: 404, message: "Resource not found." });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Server Error:", error); // log full error for debugging

  let statusCode = error.status || 500;
  let message = error.message || "Internal Server Error";
  let detail = error.detail || null;

  // MongoDB unique key error handling
  if (error.code === 11000) {
    const uniqueFailedKeys = Object.keys(error.keyPattern || {});
    detail = {};
    uniqueFailedKeys.forEach((field) => {
      detail[field] = `${field} must be unique`;
    });
    statusCode = 400;
    message = "Validation failed";
  }

  // Optional: Mongoose validation errors
  if (error.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";
    detail = {};
    Object.keys(error.errors).forEach((key) => {
      detail[key] = error.errors[key].message;
    });
  }

  res.status(statusCode).json({
    result: detail,
    message: message,
    meta: null,
  });
});

module.exports = app;
