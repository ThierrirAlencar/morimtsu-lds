import "dotenv/config";
import { z } from "zod";

export const {HOST,JWT_SECRET,PORT, ADMIN_EMAIL, ADMIN_PASSWORD} = z.object({
    PORT: z.string().default("3000"),
    HOST: z.string().default("0.0.0.0"),
    JWT_SECRET: z.string().min(1).max(255),
    ADMIN_EMAIL:z.string(),
    ADMIN_PASSWORD:z.string()
}).parse(process.env)