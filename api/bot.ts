import { Bot, webhookCallback, Context, session, SessionFlavor } from "grammy";
import * as dotenv from "dotenv";
import { createTask, getProjectById, getProjects, getSections } from "./util/asana";
import { getSetting, updateSettings,  } from "./util/supabase";

dotenv.config();

const token = process.env.BOT_TOKEN || "";
const mode = process.env.BOT_MODE;

if (!token) throw new Error("BOT_TOKEN is unset");

// Define the shape of our session.
interface SessionData {
    workspace: string;
    project: string;
}

  // Flavor the context type to include sessions.
type MyContext = Context & SessionFlavor<SessionData>;

let botcontext:any; 
const bot = new Bot<MyContext>(token);

// Install session middleware, and define the initial session value.
async function initial(): Promise<SessionData> {
    return { workspace: '', project: ''};
}
  
bot.use(session({ initial: initial as any }));

const nameArray = [
    {
        gid: "1209093882208970",
        name: "Brian",
    },
    {
        gid: "291735074243751",
        name: "Mike",
    },
    {
        gid: "1180519359737765",
        name: "Mark",
    },
];

bot.command("start", async (ctx: any) => {
    const replyMarkup = {
        inline_keyboard: [
            [
                { text: "--- Project ---", callback_data: "create_task_title" }, 
            ], 
            [
                { text: `✎ ${name}`, callback_data: "changeProject" }
            ]
        ],
    };
    
    await ctx.reply('replyText', { reply_markup: replyMarkup, parse_mode: "Markdown" });
});

// bot.command("config", async (ctx: any) => {
//     const setting = await getSetting();
//     const {name} = await getProjectById(setting.project);
//     const replyText =
//         `You can check your setting.\n`
    
//     const replyMarkup = {
//         inline_keyboard: [
//             [
//                 { text: "--- Project ---", callback_data: "create_task_title" }, 
//             ], 
//             [
//                 { text: `✎ ${name}`, callback_data: "changeProject" }
//             ]
//         ],
//     };
    
//     await ctx.reply(replyText, { reply_markup: replyMarkup, parse_mode: "Markdown" });
// });

bot.callbackQuery("changeProject", async (ctx) => {
    await ctx.reply('replyText');
    // const projects = await getProjects();

    // const replyText =
    //     `click one project to create task on.\n`
    
    // const replyMarkup = {
    //     inline_keyboard: projects.map((project:any) => [
    //         { text: project.name, callback_data: `changeProject:${project.gid}` }
    //     ]),
    // };

    // await ctx.reply(replyText, { reply_markup: replyMarkup, parse_mode: "Markdown" });
});

// bot.on("callback_query:data", async (ctx) => {
//     const callbackQuery = ctx.callbackQuery.data;
//     if(callbackQuery.startsWith("changeProject"))
//     {    
//         const project = await getProjectById(callbackQuery.split(':')[1]);
//         await updateSettings(project.workspace.gid, project.gid)

//         const setting = await getSetting();
//         const {name} = await getProjectById(setting.project);
//         const replyText =
//             `You can check your setting.\n`
        
//         const replyMarkup = {
//             inline_keyboard: [
//                 [
//                     { text: "--- Project ---", callback_data: "create_task_title" }, 
//                 ], 
//                 [
//                     { text: `✎ ${name}`, callback_data: "changeProject" }
//                 ]
//             ],
//         };
        
//         await ctx.reply(replyText, { reply_markup: replyMarkup, parse_mode: "Markdown" });

//     }
//     else {
//         console.log('callbackQuery', callbackQuery)
//     }
//     await ctx.answerCallbackQuery({
//         text: "You were curious, indeed!",
//       });
// })

// // Handle other messages.
// bot.on("message", async (ctx: any) => {
//     const messageText = ctx.message.text || "";
//     console.log("message ==> ", messageText);

//     if (messageText.toLowerCase().startsWith("createtask")) {
//         const parts = messageText.split(" ");

//         if (parts.length > 1) {
//             const loading = await ctx.reply("processing...");
//             const secondWord = parts[1].trim();
//             const user = nameArray.find((user) => user.name.toLowerCase() === secondWord.toLowerCase());

//             if (!user) {
//                 const replyText = `📢 Can't find specific name - ${secondWord}`;
//                 await ctx.api.deleteMessage(loading.chat.id, loading.message_id);
//                 return  ctx.reply(replyText, { parse_mode: "Markdown" });
//             }

//             const setting = await getSetting();

//             const thirdWord = parts[2].trim();

//             const sections = await getSections(setting.project);

//             // let section = {};
//             // let i = 0;
//             // while(1)
//             // {
//             //     let _sectionName = parts.slice(2, 3 + i).join(" ");
//             //     const _section = sections.map((section:any) => section.name.toLowerCase().startsWith(thirdWord.toLowerCase()));
//             //     if(_section.length === 1)
//             //         {
//             //             section = {..._section}
//             //             break;
//             //         }
//             //     i++;
//             // }

//             const section = sections.find((section:any) => section.name.toLowerCase().startsWith(thirdWord.toLowerCase()));

//             if (!section) {
//                 console.log(`Can't find secction from ${messageText}`);
//                 const replyText = `📢 Can't find secction from ${messageText}`;
//                 await ctx.api.deleteMessage(loading.chat.id, loading.message_id);
//                 return  ctx.reply(replyText, { parse_mode: "Markdown" });
//             }

//             // Join the remaining parts of the message
//             const command = parts.slice(2+section.name.split(' ').length).join(" ");

//             let body = {
//                 data: {
//                     name: command,
//                     assignee: user.gid,
//                     resource_subtype: "default_task",
//                     approval_status: "pending",
//                     assignee_status: "upcoming",
//                     assignee_section: section.gid,
//                     projects: [setting.project],
//                 },
//             };

//             const task = await createTask(body);


//             const taskName = task.name;
//             const projectName = task.projects[0].name;
//             const sectionName = section.name;
//             const workspaceName = task.workspace.name;
//             const taskUrl = task.permalink_url;
//             const replyText =
//                 `📢 Successfully created a task\n\n` +
//                 `**${taskName}**\n\n` +
//                 `🏠 Workspace: **${workspaceName}**\n` +
//                 `🧰 Project: **${projectName}**\n` +
//                 `🔖 Section: **${sectionName}**\n\n` +
//                 `${taskUrl}`;
//             const replyMarkup = {
//                 inline_keyboard: [[{ text: "View Task", url: taskUrl }]],
//             };
//             await ctx.api.deleteMessage(loading.chat.id, loading.message_id);
//             await ctx.reply(replyText, { reply_markup: replyMarkup, parse_mode: "Markdown" });
            
//         }
//     }
// });

if (mode === "polling")
    {bot.start({
        onStart: ({ username }: { username: string }) =>
            console.log({
                msg: "bot running...",
                username,
            }),
    });
    botcontext = bot;
}
else if (mode === "webhook") botcontext = webhookCallback(bot, "https");

export default botcontext;
