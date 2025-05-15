import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protectRoute = async (req, res, next) => {
  try {

    const token = req.header("Authorization").replace("Bearer ", "");
    if(!token){
      res.status(401).json({message: "No authentication token. Access denied"});
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
    // load the user w/o pwd
    const user = await User.findById(decoded.userId).select("-password");

    if( !user ){
      return res.status(401).json({messsage: "Invalid user token"})
    }

    req.user = user;
    next();
    
  } catch (error) {
    console.error("protectRoute/error", error );
    return res.status(500).json({messsage: "Internal server error"})
  }
}

export default protectRoute;