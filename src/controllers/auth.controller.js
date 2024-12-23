import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../modules/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import crypto from 'crypto';
import sendEmail from "../utils/sendEmail.js";


const createUser = asyncHandler(async (req, res) => {
  const { fullName, email, country, password } = req.body

  if (
    [fullName, email, country, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required")
  }

  const existedUser = await User.findOne({
    $or: [{ email }]
  })

  if (existedUser) {
    throw new ApiError(409, "User already registered!")
  }
  const verificationToken = crypto.randomBytes(20).toString('hex');
  const verificationTokenExpire = Date.now() + 10 * 60 * 1000; // Token valid for 10 minutes

  const userref = await User.create({
    fullName, email, country, password, role: "user", verificationToken, verificationTokenExpire
  })

  if (!userref) {
    throw new ApiError(500, "Could not Signup! please try again");
  }

  const verificationUrl = `${process.env.FRONTEND_URL}/api/v1/user/verifyemail/${verificationToken}`;
  const message = `You are receiving this email because you registered on our site. Please click the following link to verify your email: ${verificationUrl}`;

  try {
    await sendEmail({
      email: userref.email,
      subject: "Email Verification",
      message,
    });

    res.status(201).json(new ApiResponse(200, {}, "Account registered successfully. Please check your email to verify your account."));
  } catch (err) {
    userref.verificationToken = undefined;
    userref.verificationTokenExpire = undefined;
    await userref.save({ validateBeforeSave: false });

    throw new ApiError(500, "Email could not be sent");
  }

})

const loginUser = asyncHandler(async (req, res) => {

  const generateAccessTokenAndRefreshTokens = async (userId) => {
    try {
      const user = await User.findById(userId)
      const accessToken = user.generateAccessToken()
      const refreshToken = user.generateRefreshToken()

      user.refreshToken = refreshToken
      await user.save({ validateBeforeSave: false })

      return { accessToken, refreshToken }

    } catch (error) {
      throw new ApiError(500, "Something went wrong while generating tokens")
    }
  }

  const { email, password } = req.body

  if (!(email)) {
    throw new ApiError(400, "Email is required")
  }

  const loginres = await User.findOne({
    $or: [{ email }]
  })
  if (!loginres) {
    throw new ApiError(404, "User does not exist")
  }


  const isPasswordValid = await loginres.isPasswordCorrect(password)
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials")
  }

  if (!loginres.isVerified) {
    throw new ApiError(401, "Please verify your account")
  }

  const { accessToken, refreshToken } = await generateAccessTokenAndRefreshTokens(loginres._id)

  const loggedInUser = await User.findById(loginres._id).select(
    "-password -refreshToken"
  )

  const options = {
    httpOnly: true,
    secure: true
  }

  return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser, accessToken, refreshToken
        }, "User logged In Successfully"
      )
    )

})

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: ""
      }
    },
  )
  const options = {
    httpOnly: true,
    secure: true
  }

  return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out"))
})

const changeUserPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body

  const user = await User.findById(req.user?._id)
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password")
  }

  user.password = newPassword
  await user.save({ validateBeforeSave: false })

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Changed Successfully"))
})

const me = asyncHandler(async (req, res) => {
  const myData = await User.findById(req.user?._id).select(" -password -refreshToken ")
  if (!myData) {
    throw new ApiError(400, "Invalid User")
  }
  return res
    .status(200)
    .json(new ApiResponse(200, myData, "User fetched Successfully"))
})



export {
  createUser,
  loginUser,
  logoutUser,
  changeUserPassword,
  me
} 