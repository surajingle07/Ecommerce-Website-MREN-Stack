import { User } from "../models/userModel.js";
import bcrypt, { truncates } from "bcryptjs";
import jwt from "jsonwebtoken";
import { verifyEmail } from "../emailVerify/verifyEmail.js";
import { Session } from "../models/sessionmodel.js";
import { sendOTPMail } from "../emailVerify/sendOTPMail.js";
import cloudinary from "../utils/cloudinary.js";

export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password) {
      res.status(400).json({
        success: false,
        message: "All field are required",
      });
    }
    const user = await User.findOne({ email });
    if (user) {
      res.status(400).json({
        success: false,
        message: "User Alerady exits",
      });
    }
    const hasedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hasedPassword,
    });
    const token = jwt.sign({ id: newUser._id }, process.env.SECRET_KEY, {
      expiresIn: "10m",
    });
    verifyEmail(token, email); //send Email here
    newUser.token = token;
    await newUser.save();
    return res.status(201).json({
      success: true,
      message: "User registered Successfully",
      user: newUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const verify = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(400).json({
        success: false,
        message: "Authorization Token Is missing or invalid",
      });
    }
    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET_KEY);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return (
          res.status(400),
          json({
            success: false,
            message: "The registeration token has expired",
          })
        );
      }
      return res.status(400).json({
        success: false,
        message: "Token Verification Failed",
      });
    }
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    user.token = null;
    user.isVerified = true;
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Email Verified SuccessFully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const reVerify = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User Not found",
      });
    }
    const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "10m",
    });
    verifyEmail(token, email);
    user.token = token;
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Verification email sent again succesfully",
      token: user.token,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({
        success: false,
        message: "User not exists",
      });
    }
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password,
    );
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid Credentials",
      });
    }
    if (existingUser.isVerified === false) {
      return res.status(400).json({
        success: false,
        message: "Verify Your Account then login",
      });
    }

    //generate a token
    const accessToken = jwt.sign(
      { id: existingUser._id },
      process.env.SECRET_KEY,
      { expiresIn: "10d" },
    );
    const refreshToken = jwt.sign(
      { id: existingUser._id },
      process.env.SECRET_KEY,
      { expiresIn: "30d" },
    );

    existingUser.isloggedIn = true;
    await existingUser.save();

    //check for existing session and delete it
    const existingSession = await Session.findOne({ userId: existingUser._id });
    if (existingSession) {
      await Session.deleteOne({ userId: existingUser._id });
    }
    //create a new session
    await Session.create({ userId: existingUser._id });
    return res.status(200).json({
      success: true,
      message: `Welcome back ${existingUser.firstName}`,
      user: existingUser,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const logout = async (req, res) => {
  try {
    const userId = req.id;
    await Session.deleteMany({ userId: userId });
    await User.findByIdAndUpdate(userId, { isloggedIn: false });
    return res.status(200).json({
      success: true,
      message: "User Logout Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const forgortPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User Not Found",
      });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 100); //10 mins
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    await sendOTPMail(otp, email);

    return res.status(200).json({
      success: true,
      message: "Otp sent to email successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    const email = req.params.email;
    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "Otp is required",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({
        success: false,
        message: "Otp is not generated or alreedy verified",
      });
    }
    if (user.otpExpiry < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Otp has expired please request a new one",
      });
    }
    if (otp !== user.otp) {
      return res.status(400).json({
        success: false,
        message: "Otp is invalid",
      });
    }
    user.otp = null;
    user.otpExpiry = null;
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Otp verifies Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.messagex,
    });
  }
};

export const changePassword = async (req,res) => {
  try {
    const { newPassword, confirmPassword } = req.body;
    const { email } = req.params;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User Not Found",
      });
    }
    if (!newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All filed are required",
      });
    }
    if (newPassword!== confirmPassword){
      return res.status(400).json({
        success:false,
        message:"Password do not match"
      })
    }

    const hasedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hasedPassword;
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Password Changed SuccesFully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const allUser=async(__,res)=>{
  try {
    const users=await User.find()
    return res.status(200).json({
      success:true,
      users
    })
    
  } catch (error) {
    return res.status(500).json({
      success:false,
      message:error.message

    })
    
  }
}

export const getUserById=async(req,res)=>{
  try {
    const {userId}=req.params;
    const user=await User.findById(userId).select("-password -otp -otpExpiry -token")
    if(!user){
      return res.status(404).json({
        success:false,
        message:"User not found"
      })
    }
    res.status(200).json({
      success:true,
      user
    })
    
  } catch (error) {
    return res.status(500).json({
      success:false,
      message:error.message
    })
    
  }
}



export const updateUser = async (req, res) => {
  try {
    const userIdToUpdate = req.params.id; // ID of user to update
    const loggedInUser = req.user; // from isAuthenticated middleware

    const {
      firstName,
      lastName,
      address,
      city,
      zipCode,
      phoneNo,
      role,
    } = req.body;

    // Authorization check
    if (
      loggedInUser._id.toString() !== userIdToUpdate &&
      loggedInUser.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this profile",
      });
    }

    // Find user
    const user = await User.findById(userIdToUpdate);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Existing profile picture data
    let profilePicUrl = user.profilePic;
    let profilePicPublicId = user.profilePicPublicId;

    // If new profile picture is uploaded
    if (req.file) {
      // Delete old image from Cloudinary
      if (profilePicPublicId) {
        await cloudinary.uploader.destroy(profilePicPublicId);
      }

      // Upload new image using stream
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "profiles" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

      profilePicUrl = uploadResult.secure_url;
      profilePicPublicId = uploadResult.public_id;
    }

    // Update user fields
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.address = address || user.address;
    user.city = city || user.city;
    user.zipCode = zipCode || user.zipCode;
    user.phoneNo = phoneNo || user.phoneNo;
    user.role=role;
    user.profilePic = profilePicUrl;
    user.profilePicPublicId = profilePicPublicId;
    
    const updateUser=await user.save()
    return res.status(200).json({
      success: true,
      message: "Profile Updated successfully",
      user:updateUser
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};