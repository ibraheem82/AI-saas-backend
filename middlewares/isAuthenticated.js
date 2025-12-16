import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

//----IsAuthenticated middleware
const isAuthenticated = asyncHandler(async (req, res, next) => {
  if (req.cookies.token) {
    try {
      //! Verify the token
      const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET); //the actual login user
      //add the user to the req obj
      // If the token is valid, jwt.verify() returns the decoded payload of the token, which typically contains user-related information (e.g., user ID).
      req.user = await User.findById(decoded?.id).select("-password");
      return next();
    } catch (error) {
      // Handle different JWT errors
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: "Token has expired, please login again" });
      } else if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: "Invalid token, please login again" });
      } else {
        return res.status(401).json({ message: "Authentication failed" });
      }
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
});

export default isAuthenticated;
