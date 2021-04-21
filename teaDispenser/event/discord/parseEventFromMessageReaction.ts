import { MessageReaction, NewsChannel } from 'discord.js';
import fromDiscordMessage from '../../data/fromDiscordMessage';
import handsUpIcon from '../../data/handsUpIcon';
import kiwiIcon from '../../data/kiwiIcon';
import Event, { ChatServiceEventCommon } from '../Event';
import parseFleetLootRecord from '../parseFleetLootRecord';

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

  const eventCommon: ChatServiceEventCommon = {
    chatService: 'discord',
    channelId: messageReaction.message.channel.id,
    triggeringUserId: userId,
  };
  const message = fromDiscordMessage(messageReaction.message);
  if (messageReaction.emoji.name === handsUpIcon) {
    const fleetLootRecord = parseFleetLootRecord(message);
    if (fleetLootRecord) {
      return {
        type: '[Chat] HandsUpButtonPressed',
        ...eventCommon,
        fleetLoot: fleetLootRecord.fleetLoot,
        fleetLootRecordTitle: fleetLootRecord.title,
        needs: fleetLootRecord.needs,
      };
    }
    return null;
  }

  if (messageReaction.emoji.name === kiwiIcon) {
    const fleetLootRecord = parseFleetLootRecord(message);
    if (fleetLootRecord) {
      return {
        type: '[Chat] KiwiButtonPressed',
        ...eventCommon,
        fleetLootRecord,
        userId,
        buttonAssociatedMessageId: messageReaction.message.id,
      };
    }
    return null;
  }

  return null;
}

export default parseEventFromMessageReaction;
