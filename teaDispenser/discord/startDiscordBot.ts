import { Client, MessageReaction, NewsChannel, PartialUser, User } from 'discord.js';
import DiscordEventContext from '../data/DiscordEventContext';
import DispatchEvent from '../data/DispatchEvent';
import Event from '../Event';
import parseEventFromMessage from './parseEventFromMessage';
import parseEventFromMessageReaction from './parseEventFromMessageReaction';

async function startDiscordBot(dispatchEvent: DispatchEvent<Event>): Promise<Client> {
  const client = new Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'USER'] });

  client.on('ready', () => {
    const { user: clientUser } = client;
    if (!clientUser) {
      throw new TypeError(`Expected logged in user in client: ${client}`);
    }

    console.info(`Logged in as ${clientUser.tag}!`);

    client.on('message', async (message) => {
      if (!message.channel.isText() || message.channel instanceof NewsChannel) {
        return;
      }
      const events = parseEventFromMessage(message, clientUser.id, {
        type: 'DiscordEventContext',
        channel: message.channel,
        triggeringUser: message.author,
        messageContexts: [],
      });
      await Promise.all(events.map(dispatchEvent));
    });

    client.on(
      'messageReactionAdd',
      async (messageReaction: MessageReaction, partialUser: User | PartialUser) => {
        if (messageReaction.message.partial) {
          await messageReaction.message.fetch();
        }

        if (
          !messageReaction.message.channel.isText() ||
          messageReaction.message.channel instanceof NewsChannel
        ) {
          return;
        }
        // TODO Remove this once view parsing is supported.
        if (partialUser.id === clientUser.id) {
          return;
        }

        const events = parseEventFromMessageReaction(
          messageReaction,
          partialUser.id,
          clientUser.id,
          {
            type: 'DiscordEventContext',
            channel: messageReaction.message.channel,
            triggeringUser: partialUser as User,
            messageContexts: [{ sentMessage: messageReaction.message }],
          }
        );
        await Promise.all(events.map(dispatchEvent));
      }
    );
  });

  if (!process.env.DISCORD_BOT_TOKEN) {
    throw new TypeError('Please set the `DISCORD_BOT_TOKEN` environment variable');
  }
  await client.login(process.env.DISCORD_BOT_TOKEN);

  return client;
}

export default startDiscordBot;
