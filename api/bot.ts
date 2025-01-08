import { Bot, webhookCallback } from "grammy";
import { config } from "./constants";
import { createTask } from "./util/asana";

if (!config.bot.token) throw new Error("BOT_TOKEN is unset");

let bot: any = new Bot(config.bot.token);

bot.command("start", (ctx: any) => ctx.reply("Welcome! Up and running."));

// Handle other messages.
bot.on("message", async (ctx: any) => {
    const messageText = ctx.message.text || "";

    if (messageText.includes(`@${config.bot.username}`)) {
        const command = messageText.split(`@${config.bot.username}`).pop().trim();
        if (command) {
            const loading = await ctx.reply("processing...");
            let body = {
                data: {
                    name: command,
                    resource_subtype: "default_task",
                    approval_status: "pending",
                    assignee_status: "upcoming",
                    // "workspace": WORDSPACE_PID,
                    projects: [config.asana.project],
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
});

if (config.bot.mode === "polling")
    bot.start({
        onStart: ({ username }: { username: string }) =>
            console.log({
                msg: "bot running...",
                username,
            }),
    });
else if (config.bot.mode === "webhook") bot = webhookCallback(bot, "https");

export default bot;
