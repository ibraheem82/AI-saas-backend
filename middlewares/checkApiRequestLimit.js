import asyncHandler from "express-async-handler";
import User from "../models/User.js";

const checkApiRequestLimit = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized" });
  }
  //Find the user
  const user = await User.findById(req?.user?.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  let requestLimit = 0;

  //Determine request limit based on subscription plan
  if (user?.trialActive) {
    requestLimit = user?.monthlyRequestCount;
  } else {
    // Handle different subscription plans
    switch (user?.subscriptionPlan) {
      case "Free":
        requestLimit = 5;
        break;
      case "Basic":
        requestLimit = 50;
        break;
      case "Premium":
        requestLimit = 100;
        break;
      default:
        requestLimit = user?.monthlyRequestCount || 0;
    }
  }

  //check if the user has exceeded his/her monthly request or not
  if (user?.apiRequestCount >= requestLimit) {
    throw new Error(
      `API Request limit reached (${user?.apiRequestCount}/${requestLimit}). Please upgrade your plan or wait for the next billing cycle.`
    );
  }
  next();
});

export default checkApiRequestLimit;
