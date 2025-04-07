import express from "express";
import cors from "cors";
import "dotenv/config";
import connectToDB from "./config/db.js";
import connectToCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js";

// App Config
const app = express();
const port = process.env.PORT || 4000;

// Connect to MongoDB
connectToDB();

// Connect to Cloudinary
connectToCloudinary();

// Middleware
app.use(express.json());
app.use(cors());

// api endpoints
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.listen(port, () => console.log(`Server listening on ${port}`));
