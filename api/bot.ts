import { Bot, webhookCallback, Context, session, SessionFlavor } from 'grammy';
import * as dotenv from 'dotenv';
import { getProjectById, getProjects } from './util/asana';
import { getSetting, updateSettings } from './util/supabase';
import createTaskHanlder from './handler/createTask';

dotenv.config();

const token = process.env.BOT_TOKEN || '';
const mode = process.env.BOT_MODE;
const username = process.env.BOT_USERNAME;

if (!token) throw new Error('BOT_TOKEN is unset');

interface SessionData {
  workspace: string;
  project: string;
}

type MyContext = Context & SessionFlavor<SessionData>;

let botcontext: any;
const bot = new Bot<MyContext>(token);

async function initial(): Promise<SessionData> {
  return { workspace: '', project: '' };
}

bot.use(session({ initial: initial as any }));

bot.command('start', async (ctx: any) => {
  const args = ctx.match.split('_');

  if (args[0] === 'func')
    if (args[1] === 'changeproject') {
      const project = await getProjectById(args[2]);
      await updateSettings(project.workspace.gid, project.gid);

      const setting = await getSetting();
      const { name } = await getProjectById(setting.project);
      const replyText =
        `Your Tasks will be created on \n✅ ${name}.\n\n` + `To change the project, just input /changeProject command`;

      await ctx.reply(replyText, { parse_mode: 'Markdown' });
    } else {
    }
  else ctx.reply('Welcome! Up and running.\n\n Input /config to check your bot setting');
});

bot.command('config', async (ctx: any) => {
  const setting = await getSetting();
  const { name } = await getProjectById(setting.project);
  const replyText =
    `Your Tasks will be created on \n✅ ${name}.\n\n` + `To change the project, just input /changeProject command`;

  await ctx.reply(replyText, { parse_mode: 'Markdown' });
});

bot.command('changeProject', async (ctx: any) => {
  const loading = await ctx.reply('processing...');
  const projects = await getProjects();

  let replyText = `click one project to create task on.\n\n`;

  projects.map(async (project: any) => {
    return (replyText += `✅ [${project?.name}](https://t.me/${username}?start=func_changeproject_${project.gid})\n\n`);
  });
  await ctx.api.deleteMessage(loading.chat.id, loading.message_id);
  await ctx.reply(replyText, { parse_mode: 'Markdown' });
});

// Handle other messages.
bot.on('message', async (ctx: any) => {
  const messageText = ctx.message.text || '';

  if (messageText.toLowerCase().startsWith('createtask')) {
    createTaskHanlder(ctx, messageText);
  }
});

if (mode === 'polling') {
  bot.start({
    onStart: ({ username }: { username: string }) =>
      console.log({
        msg: 'bot running...',
        username,
      }),
  });
  botcontext = bot;
} else if (mode === 'webhook') botcontext = webhookCallback(bot, 'https');

export default botcontext;
