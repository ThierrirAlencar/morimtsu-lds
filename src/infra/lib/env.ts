import "dotenv/config";
import { z } from "zod";

export const {HOST,JWT_SECRET,PORT} = z.object({
    PORT: z.string().default("3000"),
    HOST: z.string().default("0.0.0.0"),
    JWT_SECRET: z.string().min(1).max(255)
}).parse(process.env)