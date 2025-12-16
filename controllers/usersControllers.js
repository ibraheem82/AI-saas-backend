import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";

//------Registration-----
export const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  //Validate
  if (!username || !email || !password) {
    res.status(400);
    throw new Error("Please all fields are required");
  }
  // Check the email is taken
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }
  //Hash the user password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  //create the user
  const newUser = new User({
    username,
    password: hashedPassword,
    email,
  });
  //Add the date the trial will end
  /*
  * -> new Date().getTime(): his gets the current date and time in milliseconds since the Unix epoch (January 1, 1970).

  * -> newUser.trialPeriod: This is a property of the newUser object that represents the length of the trial period in days. For example, if trialPeriod is 7, the trial will last for 7 days.

  * -> new Date(...): This creates a new Date object by adding the trial duration (in milliseconds) to the current time. The result is the date and time when the trial will expire.



  */
  newUser.trialExpires = new Date(
    new Date().getTime() + newUser.trialPeriod * 24 * 60 * 60 * 1000
  );

  //Save the user
  await newUser.save();
  res.json({
    status: true,
    message: "Registration was successfull",
    user: {
      username,
      email,
    },
  });
});





//------Login---------
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  //check for user email
  const user = await User.findOne({ email });
  if (!user) {
    res.status(401); // If no user is found, it throws an error with a 401 Unauthorized status and a message: "Invalid email or password".
    throw new Error("Invalid email or password");
  }
  //check if password is valid
  const isMatch = await bcrypt.compare(password, user?.password); // The token contains the user's id (from user._id) and is signed using a secret key (process.env.JWT_SECRET).
  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid email or password");
  }
  //Generate token (jwt)
  const token = jwt.sign({ id: user?._id }, process.env.JWT_SECRET, {
    expiresIn: "3d", //token expires in 3 days
  });
  // console.log(token);
  //set the token into cookie (http only)
  /*
  * -> This sets a cookie named "token" and assigns it the value of token.
  * -> The third argument is an options object that configures how the cookie behaves.
  * * --> httpOnly: true : This ensures the cookie cannot be accessed by JavaScript running in the browser (document.cookie). It helps prevent XSS (Cross-Site Scripting) attacks by making the cookie accessible only to the server.  The browser will send this cookie with requests, but client-side scripts cannot read or modify it.


  * - sameSite: "strict" : The cookie is only sent when the user is navigating within the same site.



  */
  res.cookie("token", token, {
    httpOnly: true, //httpOnly: true: Prevents client-side JavaScript from accessing the cookie.
    secure: process.env.NODE_ENV === "production", // Ensures the cookie is only sent over HTTPS in production.
    sameSite: "strict", //  Prevents the cookie from being sent in cross-site requests.
    maxAge: 24 * 60 * 60 * 1000, //1 day
  });

  //send the response
  res.json({
    status: "success",
    _id: user?._id,
    message: "Login success",
    username: user?.username,
    email: user?.email,
  });
});



//------Logout-----
export const logout = asyncHandler(async (req, res) => { // This clears the authentication cookie named "token".
  // Setting the cookie value to an empty string ("") removes any existing token.
  res.cookie("token", "", { maxAge: 1 }); // maxAge: 1 makes the cookie expire immediately (1 millisecond).
  res.status(200).json({ message: "Logged out successfully" });
});




//------Profile-----
export const userProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req?.user?.id).select("-password").populate("payments")
    .populate("contentHistory");
  if (user) {
    res.status(200).json({
      status: "success",
      user,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});


//------Check user Auth Status-----
export const checkAuth = asyncHandler(async (req, res) => {
  try {
    const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
    if (decoded) {
      res.json({
        isAuthenticated: true,
      });
    } else {
      res.json({
        isAuthenticated: false,
      });
    }
  } catch (error) {
    // Token is invalid or expired
    res.json({
      isAuthenticated: false,
    });
  }
});