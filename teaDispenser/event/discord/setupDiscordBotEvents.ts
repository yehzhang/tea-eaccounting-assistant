import { Client, MessageReaction, PartialUser, User } from 'discord.js';
import DispatchEvent from '../../core/DispatchEvent';
import Event from '../Event';
import parseTeaDispenserEventFromMessage from './parseTeaDispenserEventFromMessage';
import parseTeaDispenserEventFromReaction from './parseTeaDispenserEventFromReaction';

function setupDiscordBotEvents(dispatchEvent: DispatchEvent<Event>, client: Client) {
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
      const event = parseTeaDispenserEventFromReaction(
        messageReaction,
        partialUser.id,
        clientUser.id
      );
      if (event) {
        await dispatchEvent(event);
      }
    }
  );
}

export default setupDiscordBotEvents;
