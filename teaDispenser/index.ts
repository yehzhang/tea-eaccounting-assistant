import { Client, Message, MessageReaction, PartialUser, User } from 'discord.js';
import * as _ from 'lodash';
import { Event } from './event';
import { executeEvent } from './update/executeEvent';
import { setupTesseract } from './update/itemDetection/recognizeItems';
import { parseEventFromMessage } from './view/parseEventFromMessage';
import { parseEventFromMessageReaction } from './view/parseEventFromMessageReaction';
import { render, RenderedMessage, RenderedReaction } from './view/render';

async function syncReactions(message: Message, reactionContents: readonly string[], clientUserId: string) {
  await Promise.all([
    // TODO recover
    // Remove reactions no longer rendered.
    // ...message.reactions.cache
    //     .filter(reaction =>
    //         reaction.users.cache.has(clientUserId) && !reactionContents.find(
    //         reactionContent => reactionContent === reaction.emoji.name))
    //     .map(reaction => reaction.users.remove(clientUserId)),
    // Add reactions newly rendered.
    ...reactionContents
        .filter(reactionContent => !message.reactions.cache.find(
            reaction => reactionContent === reaction.emoji.name))
        .map(reactionContent => message.react(reactionContent)),
  ]);
}

async function runEvents(events: readonly Event[], contextMessage: Message, clientUserId: string, triggeringUser: User) {
  const renderedReactions = await Promise.all(
      events.map(event => runEvent(event, contextMessage, clientUserId, triggeringUser)));

  // Render reactions to the reply.
  await syncReactions(
      contextMessage, renderedReactions.flat().map(({ content }) => content), clientUserId);
}

async function runEvent(event: Event, contextMessage: Message, clientUserId: string, triggeringUser: User): Promise<readonly RenderedReaction[]> {
  const state = await executeEvent(event);

  const renderings = render(state);
  const [renderedMessages, renderedReactions] = _.partition(
      renderings,
      (rendering): rendering is RenderedMessage => rendering.type === 'RenderedMessage');
  for (const { content, replyTo, reactionContents = [] } of renderedMessages) {
    const sentMessage = await contextMessage.channel.send(typeof content === 'object' ? content : {
      content,
      // Inline reply is not supported until discord.js v13.
      reply: replyTo ? triggeringUser : undefined,
    });
    await syncReactions(sentMessage, reactionContents, clientUserId);
  }

  return renderedReactions;
}

const client = new Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'USER'] });

client.on('ready', () => {
  console.log(`Logged in as ${client.user?.tag}!`);
});

client.on('message', async (message) => {
  if (!client.user) {
    console.error('Expected the client to have a user');
    return;
  }

  const events = parseEventFromMessage(message, client.user.id);
  await runEvents(events, message, client.user.id, message.author);
});

client.on('messageReactionAdd', async (messageReaction: MessageReaction, partialUser: User | PartialUser) => {
  if (!client.user) {
    console.error('Expected the client to have a user');
    return;
  }

  if (messageReaction.message.partial) {
    await messageReaction.message.fetch();
  }

  // TODO Remove this once state parsing is supported.
  if (partialUser.id === client.user.id) {
    return;
  }

  const events = parseEventFromMessageReaction(messageReaction, partialUser.id, client.user.id);
  await runEvents(events, messageReaction.message, client.user.id, partialUser as User);
});

if (!process.env.DISCORD_BOT_TOKEN) {
  throw new TypeError('Please set the `DISCORD_BOT_TOKEN` environment variable');
}
client.login(process.env.DISCORD_BOT_TOKEN);

setupTesseract();
