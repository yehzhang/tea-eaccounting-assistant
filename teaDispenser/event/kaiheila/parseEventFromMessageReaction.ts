import Message from '../../data/Message';
import Event, { ChatServiceEventCommon } from '../Event';
import parseFleetLootRecord from '../parseFleetLootRecord';

function parseEventFromMessageReaction(
  emojiId: string,
  message: Message,
  messageId: string,
  channelId: string,
  triggeringUserId: string
): Event | null {
  const eventCommon: ChatServiceEventCommon = {
    chatService: 'kaiheila',
    channelId,
    triggeringUserId,
  };
  if (emojiId === '[#128588;]') {
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

  if (emojiId === '[#129373;]') {
    const fleetLootRecord = parseFleetLootRecord(message);
    if (fleetLootRecord) {
      return {
        type: '[Chat] KiwiButtonPressed',
        ...eventCommon,
        fleetLootRecord,
        userId: triggeringUserId,
        buttonAssociatedMessageId: messageId,
      };
    }
    return null;
  }

  return null;
}

export default parseEventFromMessageReaction;
