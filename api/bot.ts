import { Bot, webhookCallback } from "grammy";
import * as dotenv from "dotenv";

dotenv.config();

const token = process.env.BOT_TOKEN;
const mode = process.env.BOT_MODE;
if (!token) throw new Error("BOT_TOKEN is unset");

let bot:any = new Bot(token);

bot.command("start", (ctx:any) => ctx.reply("Welcome! Up and running."));

// Handle other messages.
bot.on("message", (ctx:any) => ctx.reply("Got another message!"));

if (mode === "polling") bot.start(
    {
        onStart: ({ username }:{username: string}) =>
            console.log({
                msg: "bot running...",
                username,
            }),
    }
);

else if (mode === "webhook") bot = webhookCallback(bot, "https");

export default bot