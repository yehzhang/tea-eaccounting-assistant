import { Message } from 'discord.js';
import FleetLootRecord from '../data/FleetLootRecord';
import DiscordView from '../view/discord/DiscordView';
import getFleetLootEditorUrl from './getFleetLootEditorUrl';
import getNeederChooserUrl from './getNeederChooserUrl';

function buildFleetLootRecordUpdatedView(
  fleetLootRecord: FleetLootRecord,
  message: Message
): DiscordView {
  return {
    type: 'FleetLootRecordUpdated',
    ...fleetLootRecord,
    fleetLootEditorUrl: getFleetLootEditorUrl(message.channel.id, message.id),
    neederChooserUrl: getNeederChooserUrl(message.channel.id, message.id),
  };
}

export default buildFleetLootRecordUpdatedView;
