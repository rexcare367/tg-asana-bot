import { nameArray } from '../util/constants';
import { getSetting } from '../util/supabase';
import { createTask, getSections } from '../util/asana';

const createTaskHanlder = async (ctx: any, messageText: string) => {
  const parts = messageText.split(' ');

  if (parts.length > 1) {
    const loading = await ctx.reply('processing...');
    const secondWord = parts[1].trim();
    const user = nameArray.find((user) => user.name.toLowerCase() === secondWord.toLowerCase());

    if (!user) {
      const replyText = `📢 Can't find specific name - ${secondWord}`;
      await ctx.api.deleteMessage(loading.chat.id, loading.message_id);
      return ctx.reply(replyText, { parse_mode: 'Markdown' });
    }

    const setting = await getSetting();
    const sections = await getSections(setting.project);

    const section = sections.find((section: any) =>
      section.name.toLowerCase().startsWith(parts[2].trim().toLowerCase()),
    );

    if (!section) {
      const replyText = `📢 Can't find secction from ${messageText}`;
      await ctx.api.deleteMessage(loading.chat.id, loading.message_id);
      return ctx.reply(replyText, { parse_mode: 'Markdown' });
    }

    // Join the remaining parts of the message
    const command = parts.slice(2 + section.name.split(' ').length).join(' ');
    const subParts = command.split('//');
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
  }
};

export default createTask;
