import { Router } from "express";
import { query } from "./db";

const routes = Router();

const FAKE_USER_ID = "967c1721-1651-4d88-8097-f2b374e0bad0";

const mockGroups = [
  { id: 1, name: "treino A", description: "peito e triceps" },
  { id: 2, name: "treino B", description: "costas e biceps" },
];

routes.get("/workout-groups", async (req, res) => {
  console.log("Listando grupos de treino");
  try {
    const sql = "SELECT * FROM workout_groups";
    const { rows } = await query(sql);

    return res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching workout groups:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

routes.get("/workout-groups/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const sql = "SELECT * FROM workout_groups WHERE id = $1";
    const params = [id];
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

    if (!name || !description) {
        return res.status(400).json({ message: "Name and description are required" });
    }

    try {
        const sql = `INSERT INTO workout_groups (name, description) VALUES ($1, $2) RETURNING *`;
        const params = [name, description];
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
        const sql = `UPDATE workout_groups SET name = $1, description = $2 WHERE id = $3 RETURNING *`;
        const params = [name, description, id];
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
        const sql = `DELETE FROM workout_groups WHERE id = $1 RETURNING *`;
        const params = [id];
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

export { routes };
