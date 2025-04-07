import mongoose from "mongoose";

const connectToDB = async () => {
  mongoose.connection.on("connected", () => {
    console.log("Mongoose connection established successfully");
  });
  await mongoose.connect(`${process.env.MONGO_URI}`);
};

export default connectToDB;
