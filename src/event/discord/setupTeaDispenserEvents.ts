import { MessageReaction, PartialUser, User } from 'discord.js';
import DispatchEvent from '../../core/DispatchEvent';
import teaDispenserClient from '../../external/chatService/discord/teaDispenserClient';
import Event from '../Event';
import parseTeaDispenserEventFromMessage from './parseTeaDispenserEventFromMessage';
import parseTeaDispenserEventFromReaction from './parseTeaDispenserEventFromReaction';

function setupTeaDispenserEvents(dispatchEvent: DispatchEvent<Event>) {
  const clientUser = teaDispenserClient.user!;

  teaDispenserClient.on('message', async (message) => {
    const event = parseTeaDispenserEventFromMessage(message, clientUser.id);
    if (event) {
      await dispatchEvent(event);
    }
  });

  teaDispenserClient.on(
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

export default setupTeaDispenserEvents;
