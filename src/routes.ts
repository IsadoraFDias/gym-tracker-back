import { Router } from "express";
import { query } from "./db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { isAuthenticated } from "./middlewares/isAuthenticated.js";
import { authRoutes } from "./auth.routes.js";

const routes = Router();

routes.use(authRoutes);

routes.use(isAuthenticated);

routes.use((req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "User not authenticated" });
  }
  next();
});

routes.get("/workout-groups", async (req, res) => {
  const userId = (req.user as any).id;
  try {
    const sql = "SELECT * FROM workout_groups WHERE user_id = $1";
    const params = [userId];
    const { rows } = await query(sql, params);

    return res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching workout groups:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

routes.get("/workout-groups/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const sql = "SELECT * FROM workout_groups WHERE id = $1 AND user_id = $2";

    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    const params = [id, req.user.id];
    const { rows } = await query(sql, params);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Workout group not found" });
    }
    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Error fetching workout group:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

routes.post("/workout-groups", async (req, res) => {
  const { name, description } = req.body;
  const userId = (req.user as any).id;

  if (!name || !description) {
    return res
      .status(400)
      .json({ message: "Name and description are required" });
  }

  try {
    const sql = `INSERT INTO workout_groups (name, description, user_id) VALUES ($1, $2, $3) RETURNING *`;
    const params = [name, description || null, userId];
    const { rows } = await query(sql, params);
    return res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Error creating workout group:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

routes.put("/workout-groups/:id", async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    const sql = `UPDATE workout_groups SET name = $1, description = $2 WHERE id = $3 AND user_id = $4 RETURNING *`;
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    const params = [name, description, id, req.user.id];
    const { rows } = await query(sql, params);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Workout group not found" });
    }
    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Error updating workout group:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

routes.delete("/workout-groups/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const sql = `DELETE FROM workout_groups WHERE id = $1 AND user_id = $2 RETURNING *`;
    
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    
    const params = [id, req.user.id];
    const { rows } = await query(sql, params);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Workout group not found" });
    }
    return res.status(204).send();
  } catch (error) {
    console.error("Error deleting workout group:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

routes.post("/users", async (req, res) => {
  const { password, email } = req.body;
  if (!password || !email) {
    return res.status(400).json({ message: "password and email are required" });
  }

  try {
    const sql = `INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *`;
    const params = [name, email, password];
    const { rows } = await query(sql, params);
    return res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

routes.post("/sessions", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "email and password are required" });
  }

  try {
    const sql = `SELECT id, password FROM users WHERE email = $1`;
    const params = [email];
    const { rows } = await query(sql, params);

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user.id }, "your_secret_key", {
      expiresIn: "1d",
    });

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error creating session:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export { routes };
