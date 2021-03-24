import { MessageReaction } from 'discord.js';
import DiscordEventContext from '../../data/DiscordEventContext';
import handsUpIcon from '../../data/handsUpIcon';
import kiwiIcon from '../../data/kiwiIcon';
import Event from '../Event';
import parseFleetLootRecord from './parseFleetLootRecord';

function parseEventsFromMessageReaction(
  messageReaction: MessageReaction,
  userId: string,
  clientUserId: string,
  context: DiscordEventContext
): readonly Event[] {
  const events: Event[] = [];

  if (messageReaction.message.author.id !== clientUserId) {
    return events;
  }

  if (messageReaction.emoji.name === handsUpIcon) {
    const fleetLootRecord = parseFleetLootRecord(messageReaction.message);
    if (fleetLootRecord) {
      events.push({
        type: '[Discord] HandsUpButtonPressed',
        fleetLoot: fleetLootRecord.fleetLoot,
        fleetLootRecordTitle: fleetLootRecord.title,
        needs: fleetLootRecord.needs,
        context,
      });
    }
  }

  if (messageReaction.emoji.name === kiwiIcon) {
    const fleetLootRecord = parseFleetLootRecord(messageReaction.message);
    if (fleetLootRecord) {
      events.push({
        type: '[Discord] KiwiButtonPressed',
        fleetLootRecord,
        userId,
        context,
      });
    }
  }

  return events;
}

export default parseEventsFromMessageReaction;
