import mongoose from "mongoose";

//Schema
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // Ensure email uniqueness at database level
      lowercase: true, // Store emails in lowercase for consistency
      trim: true, // Remove whitespace
    },
    password: {
      type: String,
      required: true,
      minlength: 6, // Minimum password length for security
    },
    trialPeriod: {
      type: Number,
      default: 3, //3 days
    },
    trialActive: {
      type: Boolean,
      default: true,
    },
    trialExpires: {
      type: Date,
    },
    subscriptionPlan: {
      type: String,
      enum: ["Trial", "Free", "Basic", "Premium"],
      default: "Trial",
    },
    apiRequestCount: {
      type: Number,
      default: 0,
    },
    monthlyRequestCount: {
      type: Number,
      default: 100, //100 credit //3 days
    },
    nextBillingDate: Date,
    payments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payment",
      },
    ],
    contentHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ContentHistory",
      },
    ],
  },
  {
    timestamps: true, // The timestamps option automatically adds two fields to the schema: [createdAt | updatedAt]
    /*
   *  -> When you convert a Mongoose document to a JSON representation (e.g., when sending it as a response in an API), this option tells Mongoose to include virtual properties in the resulting JSON object.
  * ->  Without this, virtual properties wouldn't be included in the JSON output. 
    */
    toJSON: { virtuals: true },
    /*
 *  -> Similar to toJSON, but this option controls whether virtual properties are included when a Mongoose document is converted to a plain JavaScript object using the .toObject() method.
 * -> This is useful for internal operations within your Node.js application.
  */
    toObject: { virtuals: true },
  }
);


// Add virtual property
// Virtual properties are properties that are not stored directly in the database. Instead, they are calculated or derived from other properties when you access them.
// * -> this refers to the current user document., which refers to the user that is currently loggedIN.
// * -> If this.trialActive is true, it means the user is supposed to be in the trial period.
// * -> If today's date is earlier than the expiration date, this returns true (trial is still valid).
// *-> If today's date is the same or after the expiration date, this returns false (trial has ended).
// userSchema.virtual('isTrialActive').get(function(){ 
//   return this.trialActive && new Date() < this.trialExpires;
// })

//! Compile to form the model
const User = mongoose.model("User", userSchema);

export default User;
