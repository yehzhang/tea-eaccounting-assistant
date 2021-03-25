import { Client, MessageReaction, PartialUser, User } from 'discord.js';
import DispatchEvent from '../../data/DispatchEvent';
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
      const event = parseEventFromMessage(message, clientUser.id);
      if (event) {
        await dispatchEvent(event);
      }
    });

    client.on(
      'messageReactionAdd',
      async (messageReaction: MessageReaction, partialUser: User | PartialUser) => {
        if (messageReaction.message.partial) {
          await messageReaction.message.fetch();
        }
        const event = parseEventFromMessageReaction(messageReaction, partialUser.id, clientUser.id);
        if (event) {
          await dispatchEvent(event);
        }
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
