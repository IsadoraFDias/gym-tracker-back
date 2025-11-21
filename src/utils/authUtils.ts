import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import 'dotenv/config';

const JWT_SECRET = process.env.JWT_SECRET || 'chave_secreta_padrao_muito_fraca';

const SALT_ROUNDS = 10;

export const hashPassword = (password: string): Promise<string> => {
    return bcrypt.hash(password, SALT_ROUNDS);
}

export const comparePassword = (password: string, hash:string): Promise<boolean> => {
    return bcrypt.compare(password, hash);
}

export const generateToken = (userId: string): string => {
    return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '1d' });
}

export const verifyToken = (token:string): any => {
    return jwt.verify(token, JWT_SECRET);
}