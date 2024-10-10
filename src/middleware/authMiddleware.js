import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

const authMiddleware = async (req, res, next) => {
  const incomingToken = req.headers.authorization;

  if (!incomingToken || !incomingToken.startsWith("Bearer ")) {
    return res.status(403).json({});
  }

  const actualToken = incomingToken.split(" ")[1];

  const decodedToken = await jwt.verify(actualToken, process.env.JWT_SECRET);

  const userExist = await User.findById(decodedToken._id);

  if (!userExist) {
    res.status(403).json({
      message: "User doesn't exist corresponding to the Token provided",
    });
  }

  req.userId = userExist._id;
  next();
};

export { authMiddleware };
