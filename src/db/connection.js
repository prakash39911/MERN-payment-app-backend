import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    const response = await mongoose.connect(process.env.MONGODB_URI);
    return response;
  } catch (error) {
    console.log("Unable to connect to Database", error);
  }
};

export default connectDB;
