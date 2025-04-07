import jwt from "jsonwebtoken";

const adminAuth = async (req, res,next) => {
  try {
    const { token } = req.headers;
    if (!token) return res.status(401).json({ error: "Token not provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (decoded !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
      return res.status(403).json({ error: "Invalid token" });
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export default adminAuth;
