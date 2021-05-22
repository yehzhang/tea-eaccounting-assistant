import Reader from '../../../core/Reader/Reader';
import MessageContext from '../../../data/MessageContext';
import toUrlFriendlyChatService from '../../../data/toUrlFriendlyChatService';
import { WebNeederChooserRequestedEvent } from '../../../event/Event';
import webServerBaseUrl from '../../../external/webServer/webServerBaseUrl';
import MessageRenderingContext from '../../../render/message/MessageRenderingContext';
import dispatchView from '../../../render/webServer/dispatchView';
import WebServerRenderingContext from '../../../render/webServer/WebServerRenderingContext';
import areNeedsEditable from './areNeedsEditable';
import fleetLootRecordReader from './fleetLootRecordReader';

function updateOnWebNeederChooserRequested(
  event: WebNeederChooserRequestedEvent
): Reader<WebServerRenderingContext & MessageRenderingContext & MessageContext, boolean> {
  const { channelId, messageId, chatService } = event;
  return fleetLootRecordReader.bind((fleetLootRecord) => {
    if (!fleetLootRecord) {
      return dispatchView({
        type: 'InvalidFleetLootRecordView',
      });
    }

    const { fleetLoot } = fleetLootRecord;
    if (!areNeedsEditable(fleetLoot)) {
      return dispatchView({
        type: 'PendingFleetLootRecordView',
      });
    }

    const needsEditorLinks = fleetLoot.fleetMembers.map(({ name }) => ({
      needer: name,
      needsEditorUrl: `${webServerBaseUrl}/needs-editor/${toUrlFriendlyChatService(
        chatService
      )}/${channelId}/${messageId}/${encodeURIComponent(name)}`,
    }));
    return dispatchView({
      type: 'NeederChooserView',
      needsEditorLinks,
    });
  });
}

export default updateOnWebNeederChooserRequested;
