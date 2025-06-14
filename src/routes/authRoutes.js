import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const router = express.Router();

const generateToken = userId => {
  return jwt.sign({userId}, process.env.JWT_SECRET, {expiresIn: "15d"})
}

router.get('/check', async (req,res) => {
  console.log("check/");
  return res.json({message: "Check passed"});
})


/**
 * Registration endpoint
 */
router.post("/register", async (req, res) => {
  // console.log("register/");

  try {
    const { email, username, password } = req.body;
    console.log("register/", {email, username});

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
    // console.log("register/ info valid, checking email existence");
    
    const existingEmail = await User.findOne({ email });
    // console.log("register/ found?", {existingEmail});

    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // console.log("register/ info valid, checking username existence");
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
    // console.log("register/ user built, about to save", { user });

    // create the user, pwd hashed in User prehook
    const rsp = await user.save();
    // console.log("register/ user saved", {rsp});

    // create JWT for the user/session
    const token = generateToken(user._id);
    // console.log("register/ token", { token });

    // return the token & user data minus the pwd
    return res.status(201).json({token, user: {
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
  console.log("login/");
  
  try {
    const {email, password} = req.body;
    if(!email || !password){
      return res.status(400).json({"message":"All fields required"});
    }

    // check if user exists

     const user = await User.findOne({email});
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
    res.status(500).json({message: 'r130, Internal server error'})
  }
});

export default router;
