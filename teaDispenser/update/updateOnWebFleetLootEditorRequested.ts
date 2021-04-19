import DispatchView from '../data/DispatchView';
import MessageApi from '../data/MessageApi';
import { WebFleetLootEditorRequestedEvent } from '../event/Event';
import WebPageView from '../view/webPage/WebPageView';
import fetchFleetLootRecord from './fetchFleetLootRecord';

async function updateOnWebFleetLootEditorRequested(
  event: WebFleetLootEditorRequestedEvent,
  dispatchView: DispatchView<WebPageView>,
  messageApi: MessageApi
): Promise<boolean> {
  const { channelId, messageId } = event;
  const fleetLootRecord = await fetchFleetLootRecord(messageApi, channelId, messageId);
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
