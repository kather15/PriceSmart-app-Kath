import jsonwebtoken from "jsonwebtoken";
import { config } from "../config.js";

export const validateAuthToken = (allowedUserTypes = []) => {
  return (req, res, next) => {
    try {
      const { authToken } = req.cookies;

      if (!authToken) {
        return res.status(401).json({
          message: "No auth token found. Authorization required.",
        });
      }

      const decoded = jsonwebtoken.verify(authToken, config.JWT.secret);
      req.user = decoded;

      const userType = decoded.userType.toLowerCase(); 
      const allowed = allowedUserTypes.map((t) => t.toLowerCase());

      if (!allowed.includes(userType)) {
        return res.status(403).json({ message: "Access denied." });
      }

      next();
    } catch (error) {
      console.error("Auth error:", error);
      return res.status(401).json({ message: "Invalid or expired token." });
    }
  };
};
