import { Client, MessageReaction, PartialUser, User } from 'discord.js';
import DiscordEventContext from '../data/DiscordEventContext';
import { Event } from '../event';
import parseEventFromMessage from './parseEventFromMessage';
import parseEventFromMessageReaction from './parseEventFromMessageReaction';

async function setupBot(dispatchEvent: (event: Event, context: DiscordEventContext) => Promise<void>) {
  const client = new Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'USER'] });

  client.on('ready', () => {
    const { user: clientUser } = client;
    if (!clientUser) {
      throw new TypeError(`Expected logged in user in client: ${client}`);
    }

    console.log(`Logged in as ${clientUser.tag}!`);

    client.on('message', async (message) => {
      const events = parseEventFromMessage(message, clientUser.id);
      await Promise.all(events.map(event => dispatchEvent(event, {
        message,
        clientUser,
        triggeringUser: message.author,
        messageContexts: [],
      })));
    });

    client.on('messageReactionAdd', async (messageReaction: MessageReaction, partialUser: User | PartialUser) => {
      if (messageReaction.message.partial) {
        await messageReaction.message.fetch();
      }

      // TODO Remove this once state parsing is supported.
      if (partialUser.id === clientUser.id) {
        return;
      }

      const events = parseEventFromMessageReaction(messageReaction, partialUser.id, clientUser.id);
      await Promise.all(events.map(event => dispatchEvent(event, {
        message: messageReaction.message,
        clientUser,
        triggeringUser: partialUser as User,
        messageContexts: [],
      })));
    });
  });

  if (!process.env.DISCORD_BOT_TOKEN) {
    throw new TypeError('Please set the `DISCORD_BOT_TOKEN` environment variable');
  }
  await client.login(process.env.DISCORD_BOT_TOKEN);
}

export default setupBot;
