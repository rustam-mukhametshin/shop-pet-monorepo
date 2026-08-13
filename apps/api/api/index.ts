import mongoose from "mongoose";
import app from "../app";

const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI!);
  }
};

export default async (req: any, res: any) => {
  await connectDB();
  return app(req, res);
};
