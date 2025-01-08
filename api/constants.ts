import * as dotenv from "dotenv";
import { z } from "zod";

// Load environment variables from .env file
dotenv.config();

// Define a schema for the expected environment variables
const envSchema = z.object({
  BOT_TOKEN: z.string().nonempty("BOT_TOKEN is required"),
  BOT_USERNAME: z.string().nonempty("BOT_USERNAME is required"),
  BOT_MODE: z.string().optional(),  // Optional if there's a default or not strictly required
  ASANA_TOKEN: z.string().nonempty("ASANA_TOKEN is required"),
  ASANA_PROJECT: z.string().nonempty("ASANA_PROJECT_PID is required"),
});

// Validate the environment variables against the schema
const env = envSchema.safeParse(process.env);

if (!env.success) {
  console.error("Invalid environment variables:", env.error.format());
  process.exit(1); // Exit the process if validation fails
}

// Load validated environment variables into your configuration
export const config = {
  bot: {
    token: env.data.BOT_TOKEN,
    username: env.data.BOT_USERNAME,
    mode: env.data.BOT_MODE, // Optional if BOT_MODE is not strictly required
  },
  asana: {
    token: env.data.ASANA_TOKEN,
    project: env.data.ASANA_PROJECT,
  },
};