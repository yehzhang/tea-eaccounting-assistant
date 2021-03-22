import { DMChannel, Message, TextChannel } from 'discord.js';
import DiscordEventContext from '../data/DiscordEventContext';
import DispatchView from '../data/DispatchView';
import FleetLootRecord from '../data/FleetLootRecord';
import DiscordView from '../view/discord/DiscordView';
import buildFleetLootRecordUpdatedView from './buildFleetLootRecordUpdatedView';

async function dispatchFleetLootRecordUpdatedView(
  fleetLootRecord: FleetLootRecord,
  message: Message,
  channel: TextChannel | DMChannel,
  dispatchDiscordView: DispatchView<DiscordView, DiscordEventContext>
): Promise<void> {
  return dispatchDiscordView(buildFleetLootRecordUpdatedView(fleetLootRecord, message), {
    type: 'DiscordEventContext',
    channel,
    sentMessage: message,
  });
}

export default dispatchFleetLootRecordUpdatedView;
