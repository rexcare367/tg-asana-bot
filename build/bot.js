"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const grammy_1 = require("grammy");
const constants_1 = require("./constants");
const asana_1 = require("./util/asana");
if (!constants_1.config.bot.token)
    throw new Error("BOT_TOKEN is unset");
let bot = new grammy_1.Bot(constants_1.config.bot.token);
bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));
// Handle other messages.
bot.on("message", async (ctx) => {
    const messageText = ctx.message.text || "";
    if (messageText.includes(`@${constants_1.config.bot.username}`)) {
        const command = messageText.split(`@${constants_1.config.bot.username}`).pop().trim();
        if (command) {
            const loading = await ctx.reply("processing...");
            let body = {
                data: {
                    name: command,
                    resource_subtype: "default_task",
                    approval_status: "pending",
                    assignee_status: "upcoming",
                    // "workspace": WORDSPACE_PID,
                    projects: [constants_1.config.asana.project],
                },
            };
            const task = await (0, asana_1.createTask)(body);
            const taskName = task.name;
            const projectName = task.projects[0].name;
            const workspaceName = task.workspace.name;
            const taskUrl = task.permalink_url;
            const replyText = `📢 Successfully created a task\n\n` +
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
if (constants_1.config.bot.mode === "polling")
    bot.start({
        onStart: ({ username }) => console.log({
            msg: "bot running...",
            username,
        }),
    });
else if (constants_1.config.bot.mode === "webhook")
    bot = (0, grammy_1.webhookCallback)(bot, "https");
exports.default = bot;
