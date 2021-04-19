import DispatchView from '../data/DispatchView';
import MessageApi from '../data/MessageApi';
import webServerBaseUrl from '../data/webServerBaseUrl';
import { WebNeederChooserRequestedEvent } from '../event/Event';
import WebPageView from '../view/webPage/WebPageView';
import areNeedsEditable from './areNeedsEditable';
import fetchFleetLootRecord from './fetchFleetLootRecord';

async function updateOnWebNeederChooserRequested(
  event: WebNeederChooserRequestedEvent,
  dispatchView: DispatchView<WebPageView>,
  messageApi: MessageApi
): Promise<boolean> {
  const { channelId, messageId, messageServiceProvider } = event;
  const fleetLootRecord = await fetchFleetLootRecord(messageApi, channelId, messageId);
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

  const needsEditorLinks = fleetLoot.fleetMembers.map((fleetMember) => ({
    needer: fleetMember,
    needsEditorUrl: `${webServerBaseUrl}/needs-editor/${messageServiceProvider}/${channelId}/${messageId}/${encodeURIComponent(
      fleetMember
    )}`,
  }));
  return dispatchView({
    type: 'NeederChooserView',
    needsEditorLinks,
  });
}

export default updateOnWebNeederChooserRequested;
