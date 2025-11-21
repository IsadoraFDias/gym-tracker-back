import {Router} from "express";
import {query} from "./db.js";
import { hashPassword, comparePassword, generateToken } from "./utils/authUtils.js";

const authRoutes = Router();

authRoutes.post("/users", async (req, res) => {
    const {name, email, password} = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({message: "name, email and password are required"});
    }

    try{
        const password_hash = await hashPassword(password);
        const sql = `INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *`;
        const params = [name, email, password_hash];
        const {rows} = await query(sql, params);
        return  res.status(201).json({id: rows[0].id,name, email});
    } catch (error) {
        if((error as any).code === '23505'){
            return res.status(409).json({message: "Email already in use"});
        }
        return res.status(500).json({message: "Internal server error"});    
    
    }
})

authRoutes.post("/sessions", async (req, res) => {
    const {email, password} = req.body;

    try {
        const {rows} = await query(`SELECT id, password FROM users WHERE email = $1`, [email]);
        const user = rows[0];

        if(!user){
            return res.status(401).json({message: "Invalid email or password"});
        }
        const passwordMatch = await comparePassword(password, user.password);
        if(!passwordMatch){
            return res.status(401).json({message: "Invalid email or password"});
        }
        const token = generateToken(user.id);
        return res.status(200).json({token, userID: user.id});
    } catch (error) {
        return res.status(500).json({message: "Internal server error"});
    }
})

export {authRoutes};