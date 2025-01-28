import { Bot, webhookCallback, Context, session, SessionFlavor } from 'grammy';
import * as dotenv from 'dotenv';
import { createTask, getProjectById, getProjects, getSections } from './util/asana';
import { getSetting, updateSettings } from './util/supabase';
import createTaskHanlder from './handler/createTask';
import { nameArray } from './util/constants';

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
    const parts = messageText.split(' ');
    console.log('messageText :>> ', nameArray, messageText);
    if (parts.length > 1) {
      const loading = await ctx.reply('processing...');
      console.log('loading :>> ', loading);
      const secondWord = parts[1].trim();
      console.log('secondWord :>> ', secondWord);
      const user = nameArray.find((user) => user.name.toLowerCase() === secondWord.toLowerCase());
      console.log('user :>> ', user);

      if (!user) {
        console.log('nameArray :>> ', nameArray);
        const replyText = `📢 Can't find specific name - ${secondWord}`;
        await ctx.api.deleteMessage(loading.chat.id, loading.message_id);
        await ctx.reply(replyText, { parse_mode: 'Markdown' });
        return;
      }

      console.log('user :>> ', user);

      const setting = await getSetting();
      const sections = await getSections(setting.project);

      const section = sections.find((section: any) =>
        section.name.toLowerCase().startsWith(parts[2].trim().toLowerCase()),
      );

      if (!section) {
        console.log('sections :>> ', sections);
        const replyText = `📢 Can't find secction from ${messageText}`;
        await ctx.api.deleteMessage(loading.chat.id, loading.message_id);
        await ctx.reply(replyText, { parse_mode: 'Markdown' });
        return;
      }
      console.log('section :>> ', section);

      // Join the remaining parts of the message
      const command = parts.slice(2 + section.name.split(' ').length).join(' ');
      console.log('command :>> ', command);
      const subParts = command.split('//');
      console.log('subParts :>> ', subParts);
      const name = subParts[0];
      const notes = subParts.slice(1).join('//');

      let body = {
        data: {
          name: name,
          notes: notes,
          assignee: user.gid,
          resource_subtype: 'default_task',
          approval_status: 'pending',
          assignee_status: 'upcoming',
          assignee_section: section.gid,
          projects: [setting.project],
        },
      };

      const task = await createTask(body);

      const taskName = task.name;
      const projectName = task.projects[0].name;
      const sectionName = section.name;
      const workspaceName = task.workspace.name;
      const taskUrl = task.permalink_url;
      const replyText =
        `📢 Successfully created a task\n\n` +
        `**${taskName}**\n\n` +
        `🏠 Workspace: **${workspaceName}**\n` +
        `🧰 Project: **${projectName}**\n` +
        `🔖 Section: **${sectionName}**\n\n` +
        `${taskUrl}`;
      const replyMarkup = {
        inline_keyboard: [[{ text: 'View Task', url: taskUrl }]],
      };
      await ctx.api.deleteMessage(loading.chat.id, loading.message_id);
      await ctx.reply(replyText, { reply_markup: replyMarkup, parse_mode: 'Markdown' });
      return;
    }
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
