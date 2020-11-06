import { Client, Message, MessageReaction, PartialUser, User } from 'discord.js';
import * as _ from 'lodash';
import { setupTesseract } from './data/itemDetection';
import { Event } from './event';
import { executeEvent } from './update/executeEvent';
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

async function runEvents(events: readonly Event[], message: Message, clientUserId: string, triggeringUserId: string) {
  const renderedReactions = await Promise.all(
      events.map(event => runEvent(event, message, clientUserId, triggeringUserId)));

  // Render reactions to the reply.
  await syncReactions(
      message, renderedReactions.flat().map(({ content }) => content), clientUserId);
}

async function runEvent(event: Event, message: Message, clientUserId: string, triggeringUserId: string): Promise<readonly RenderedReaction[]> {
  const state = await executeEvent(event);

  const renderings = render(state);
  const [renderedMessages, renderedReactions] = _.partition(
      renderings,
      (rendering): rendering is RenderedMessage => rendering.type === 'RenderedMessage');
  if (renderedMessages.length) {
    const initialRenderedMessage = renderedMessages[0];
    const firstReply = await message.channel.send(
        `<@!${triggeringUserId}>，${initialRenderedMessage.content}`);
    await syncReactions(firstReply, initialRenderedMessage.reactionContents || [], clientUserId);

    for (const renderedMessage of renderedMessages.slice(1)) {
      const sentMessage = await message.channel.send(renderedMessage.content);
      await syncReactions(sentMessage, renderedMessage.reactionContents || [], clientUserId);
    }
  }

  return renderedReactions;
}

const client = new Client();
// const client = new Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });

client.on('ready', () => {
  console.log(`Logged in as ${client.user?.tag}!`);
});

client.on('message', async (message) => {
  if (!client.user) {
    console.error('Expected the client to have a user');
    return;
  }

  const events = parseEventFromMessage(message, client.user.id);
  await runEvents(events, message, client.user.id, message.author.id);
});

client.on('messageReactionAdd', async (messageReaction: MessageReaction, partialUser: User | PartialUser) => {
  if (!client.user) {
    console.error('Expected the client to have a user');
    return;
  }

  // TODO Fetch partial.
  // if (messageReaction.message.partial) {
  //   await messageReaction.message.fetch();
  // }
  // await Promise.all(messageReaction.message.reactions.cache.mapValues(reaction => reaction.users.fetch()));

  // TODO Remove this once state parsing is supported.
  if (partialUser.id === client.user.id) {
    return;
  }

  const events = parseEventFromMessageReaction(messageReaction, partialUser.id, client.user.id);
  await runEvents(events, messageReaction.message, client.user.id, partialUser.id);
});

client.login('Nzc2MjMzMjE2NzkzMTE2Njgz.X6x5hA.6mc6QhFiO-GM-ndGVadgCzrrFk8');

setupTesseract();
