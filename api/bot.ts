import { Bot, webhookCallback } from "grammy";
import * as dotenv from "dotenv";
import { createTask } from "./util/asana";

dotenv.config();

const token = process.env.BOT_TOKEN || "";
const username = process.env.BOT_USERNAME;
const mode = process.env.BOT_MODE;
const project = process.env.ASANA_PROJECT;

if (!token) throw new Error("BOT_TOKEN is unset");

let bot: any = new Bot(token);
const nameArray = [
    {
        gid: "1209093882208970",
        name: "Brian",
    },
    {
        gid: "1209102217407553",
        name: "Mike",
    },
    {
        gid: "1180519359737765",
        name: "Mark",
    },
];

bot.command("start", (ctx: any) => ctx.reply("Welcome! Up and running."));

// Handle other messages.
bot.on("message", async (ctx: any) => {
    const messageText = ctx.message.text || "";
    console.log("message ==> ", messageText);

    if (messageText.toLowerCase().startsWith("createtask")) {
        const parts = messageText.split(" ");

        if (parts.length > 1) {
            const secondWord = parts[1].trim();
            const user = nameArray.find((user) => user.name === secondWord);

            if (user) {
                // Join the remaining parts of the message
                const command = parts.slice(2).join(" ");

                const loading = await ctx.reply("processing...");
                let body = {
                    data: {
                        name: command,
                        assignee: user.gid,
                        resource_subtype: "default_task",
                        approval_status: "pending",
                        assignee_status: "upcoming",
                        // "workspace": WORDSPACE_PID,
                        projects: [project],
                    },
                };
                const task = await createTask(body);

                const taskName = task.name;
                const projectName = task.projects[0].name;
                const workspaceName = task.workspace.name;
                const taskUrl = task.permalink_url;
                const replyText =
                    `📢 Successfully created a task\n\n` +
                    `**${taskName}**\n\n` +
                    `🏠 Workspace: **${workspaceName}**\n` +
                    `🧰 Project: **${projectName}**\n\n` +
                    `${taskUrl}`;
                const replyMarkup = {
                    inline_keyboard: [[{ text: "View Task", url: taskUrl }]],
                };
                await ctx.api.deleteMessage(loading.chat.id, loading.message_id);
                await ctx.reply(replyText, { reply_markup: replyMarkup, parse_mode: "Markdown" });
            }
        }
    }
});

if (mode === "polling")
    bot.start({
        onStart: ({ username }: { username: string }) =>
            console.log({
                msg: "bot running...",
                username,
            }),
    });
else if (mode === "webhook") bot = webhookCallback(bot, "https");

export default bot;
