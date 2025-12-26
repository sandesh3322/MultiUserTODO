require("dotenv").config();
const jwt = require('jsonwebtoken');
const userSvc = require("../modules/user/user.service");

const logincheck = async (req, res, next) => {
  try {
    let token = req.headers['authorization'] || null;
    if (!token) {
      throw { status: 401, message: "Unauthorized access: token missing" };
    }

    // Extract Bearer token
    token = token.split(" ").pop();
    // console.log(token)

    let data;
    try {
      data = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      // Token invalid or expired
      if (err.name === "TokenExpiredError") {
        throw { status: 401, message: "Token has expired" };
      } else if (err.name === "JsonWebTokenError") {
        throw { status: 401, message: "Invalid token" };
      } else {
        throw err;
      }
    }

    // Optional: check for token type property
    if (data.hasOwnProperty("type")) {
      throw { status: 403, message: "Access token required" };
    }

    const user = await userSvc.getSingleUserByFilter({ _id: data.sub });
    if (!user) {
      throw { status: 401, message: "User not found for this token" };
    }

    req.authuser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    next();
  } catch (exception) {
    console.log("Auth middleware error:", exception);
    next({ status: exception.status || 401, message: exception.message || "Unauthorized" });
  }
};

module.exports = logincheck;
