import { Client, MessageReaction, PartialUser, User } from 'discord.js';
import DispatchEvent from '../../data/DispatchEvent';
import getEnvironmentVariable from '../../external/getEnvironmentVariable';
import Event from '../Event';
import parseTeaDispenserEventFromMessage from './parseTeaDispenserEventFromMessage';
import parseTeaDispenserEventFromReaction from './parseTeaDispenserEventFromReaction';

async function startDiscordBot(dispatchEvent: DispatchEvent<Event>): Promise<Client> {
  const client = new Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'USER'] });

  client.on('ready', () => {
    const { user: clientUser } = client;
    if (!clientUser) {
      throw new TypeError(`Expected logged in user in client: ${client}`);
    }

    console.info(`Logged in as ${clientUser.tag}!`);

    client.on('message', async (message) => {
      const event = parseTeaDispenserEventFromMessage(message, clientUser.id);
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
        const event = parseTeaDispenserEventFromReaction(messageReaction, partialUser.id, clientUser.id);
        if (event) {
          await dispatchEvent(event);
        }
      }
    );
  });

  const discordBotToken = getEnvironmentVariable('DISCORD_BOT_TOKEN');
  await client.login(discordBotToken);

  return client;
}

export default startDiscordBot;
