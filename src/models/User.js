import mongoose from "mongoose";
import bcrypt from "bcryptjs"

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minLength: 6,
  },
  profileImage: {
    type: String,
    default: "",
  }
},
  {timestamps: true});

// hash pwd before saving to db
userSchema.pre("save", async function (next) {
  console.log("userSchema.pre/");

  if(!this.isModified("password")){
    return next();
  }

  const salt = await bcrypt.getSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// password comparison
userSchema.methods.comparePassword = async function (userPassword){
  return await bcrypt.compare(userPassword, this.password);
}

// create user mondel
const User = mongoose.model("User", userSchema);

export default User;
