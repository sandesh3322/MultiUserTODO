const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["INACTIVE", "ACTIVE", "SUSPENDED"],
    default: "INACTIVE"
  },
  activationToken: { type: String, default: null },
  activateFor: { type: Date, default: null },
  refreshToken: { type: String, default: null }, // optional: if storing refresh tokens
  forgetToken: { type: String, default: null },
  forgetFor: { type: Date, default: null },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
