import mongoose, { Schema } from "mongoose";
import bcryptjs from "bcryptjs"
import jwt from "jsonwebtoken";


const UserSchema = new Schema({
  fullName: {
    type: String,
    required: [true, 'fullName is Required'],
  },

  password: {
    type: String,
    required: [true, 'Passwrd is Required']
  },

  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please add a valid email",
    ],
  },

  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
    required: true
  },

  country: {
    type: String,
    required: [true, 'Address is required'],
  },

  saved: [{
    type: Schema.ObjectId,
    ref: 'User',
  }],

  refreshToken: {
    type: String
  },

  verificationToken: String,

  verificationTokenExpire: Date,

  isVerified: {
    type: Boolean,
    default: false
  },

}, { timestamps: true });


UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcryptjs.hash(this.password, 10)
  console.log(this.password)
  console.log('there you go again')
  next()
})

UserSchema.methods.isPasswordCorrect = async function (password) {
  return await bcryptjs.compare(password, this.password)
}

UserSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  )
}

UserSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
  )
}

export const User = mongoose.model("User", UserSchema);



