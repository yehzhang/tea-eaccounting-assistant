import ChatService from '../data/ChatService';
import FleetLootRecord from '../data/FleetLootRecord';
import MessageView from '../view/message/MessageView';
import getFleetLootEditorUrl from './getFleetLootEditorUrl';
import getNeederChooserUrl from './getNeederChooserUrl';

function buildFleetLootRecordUpdatedView(
  serviceProvider: ChatService,
  fleetLootRecord: FleetLootRecord,
  channelId: string,
  messageId: string
): MessageView {
  return {
    type: 'FleetLootRecordUpdatedView',
    ...fleetLootRecord,
    fleetLootEditorUrl: getFleetLootEditorUrl(serviceProvider, channelId, messageId),
    neederChooserUrl: getNeederChooserUrl(serviceProvider, channelId, messageId),
  };
}

export default buildFleetLootRecordUpdatedView;
