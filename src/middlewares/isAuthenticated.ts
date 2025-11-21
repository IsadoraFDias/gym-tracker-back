import { Request, Response, NextFunction } from "express";
import {verifyToken} from "../utils/authUtils.js";

interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
    };
}

export function isAuthenticated(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token not provided" });
  }

  const [, token] = authHeader.split(" ");

  try {
    const decoded = verifyToken(token);

    req.user = { id: decoded.id };

    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      id: string;
    };
  }
}