import { MessageReaction, NewsChannel } from 'discord.js';
import { nanoid } from 'nanoid';
import fromDiscordMessage from '../../data/fromDiscordMessage';
import handsUpIcon from '../../data/handsUpIcon';
import kiwiIcon from '../../data/kiwiIcon';
import MessageEventContext from '../../data/MessageEventContext';
import Event from '../Event';
import parseFleetLootRecord from './parseFleetLootRecord';

function parseEventFromMessageReaction(
  messageReaction: MessageReaction,
  userId: string,
  clientUserId: string
): Event | null {
  if (
    !messageReaction.message.channel.isText() ||
    messageReaction.message.channel instanceof NewsChannel
  ) {
    return null;
  }
  // TODO Remove this once update logic is updated.
  if (userId === clientUserId) {
    return null;
  }
  if (messageReaction.message.author.id !== clientUserId) {
    return null;
  }

  const context: MessageEventContext = {
    eventId: nanoid(),
    serviceProvider: 'discord',
    channelId: messageReaction.message.channel.id,
    triggeringUserId: userId,
    messageIdToEdit: messageReaction.message.id,
  };
  const message = fromDiscordMessage(messageReaction.message);
  if (messageReaction.emoji.name === handsUpIcon) {
    const fleetLootRecord = parseFleetLootRecord(message);
    if (fleetLootRecord) {
      return {
        type: '[Discord] HandsUpButtonPressed',
        fleetLoot: fleetLootRecord.fleetLoot,
        fleetLootRecordTitle: fleetLootRecord.title,
        needs: fleetLootRecord.needs,
        context,
      };
    }
  }

  if (messageReaction.emoji.name === kiwiIcon) {
    const fleetLootRecord = parseFleetLootRecord(message);
    if (fleetLootRecord) {
      return {
        type: '[Discord] KiwiButtonPressed',
        fleetLootRecord,
        userId,
        context,
      };
    }
  }

  return null;
}

export default parseEventFromMessageReaction;
