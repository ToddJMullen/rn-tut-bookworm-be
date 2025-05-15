import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const router = express.Router();

const generateToken = userId => {
  return jwt.sign({userId}, process.env.JWT_SECRET, {expiresIn: "15d"})
}


/**
 * Registration endpoint
 */
router.post("/register", async (req, res) => {
  console.log("register/", req);

  try {
    const { email, username, password } = req.body;
  console.log("register/", {req, email, username, password});

    // validate fields
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password should be at least 6 characters long" });
    }
    if (username.length < 3) {
      return res
        .status(400)
        .json({ message: "Username should be at least 3 characters long" });
    }

    // check user existence

    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const existingUsername = await User.findOne({ username });

    if (existingUsername) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // user is clear

    // get a random avatar
    const profileImage = `https://api.dicebear.com/9.x/pixel-art/svg?seed=${username}`;

    const user = new User({
      email,
      username,
      password,
      profileImage,
    });

    // create the user, pwd hashed in User prehook
    await user.save();

    // create JWT for the user/session
    const token = generateToken(user._id);

    // return the token & user data minus the pwd
    res.status(201).json({token, user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      profileImage: user.profileImage
    }});


  } catch (error) {
    console.error("register/", error);
  }
}); // register


/**
 * User login endpoint
 */
router.post("/login", async (req, res) => {
  console.log("login/", req);
  
  try {
    const {email, password} = req.body;
    if(!email || !password){
      return res.status(400).json({"message":"All fields required"});
    }

    // check if user exists

     const user = User.findOne({email});
     if(!user){
      return res.status(400).json({message: "Invalid credentials"})
     }

     // check password
     const isPasswordCorrect = await user.comparePassword(password);
     if(!isPasswordCorrect){
      return res.status(400).json({message:'Invalid credentials!'});
     }

     // create token

     const token = generateToken(user._id);
     
     return res.status(200).json({token, user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      profileImage: user.profileImage
    }});


  } catch (error) {
    console.error('login/error', error);
    res.status(500).json({message: 'Internal server error'})
  }
});

export default router;
