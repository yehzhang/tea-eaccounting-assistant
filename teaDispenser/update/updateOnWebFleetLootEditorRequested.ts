import DispatchView from '../data/DispatchView';
import { WebFleetLootEditorRequestedEvent } from '../event/Event';
import WebPageView from '../view/webPage/WebPageView';
import fetchFleetLootRecord from './fetchFleetLootRecord';

async function updateOnWebFleetLootEditorRequested(
  event: WebFleetLootEditorRequestedEvent,
  dispatchView: DispatchView<WebPageView>,
): Promise<boolean> {
  const { channelId, messageId, ie10OrBelow, chatService } = event;
  if (ie10OrBelow) {
    return dispatchView({
      type: 'UnsupportedIeBrowserView',
    });
  }

  const fleetLootRecord = await fetchFleetLootRecord(chatService, channelId, messageId);
  return dispatchView(
    fleetLootRecord
      ? {
          type: 'FleetLootEditorView',
          ...fleetLootRecord,
        }
      : {
          type: 'InvalidFleetLootRecordView',
        }
  );
}

export default updateOnWebFleetLootEditorRequested;
