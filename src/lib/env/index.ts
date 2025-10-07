import "dotenv/config";
import z from "zod";

export const env = z.object({
    DATABASE_URL:z.string(),
    JWT_SECRET:z.string(),
    JWT_EXPIRATION_TIME:z.string().default("1h"),
    BCRYPT_SALT_ROUNDS:z.coerce.number().default(10),
    API_HOST:z.string(),
    API_PORT:z.coerce.number(),
    API_DOCS:z.string()
}).parse(process.env);