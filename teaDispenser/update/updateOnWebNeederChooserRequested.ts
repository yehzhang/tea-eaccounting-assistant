import DispatchView from '../data/DispatchView';
import { WebNeederChooserRequestedEvent } from '../event/Event';
import webServerBaseUrl from '../external/webServerBaseUrl';
import WebPageView from '../view/webPage/WebPageView';
import areNeedsEditable from './areNeedsEditable';
import fetchFleetLootRecord from './fetchFleetLootRecord';

async function updateOnWebNeederChooserRequested(
  event: WebNeederChooserRequestedEvent,
  dispatchView: DispatchView<WebPageView>
): Promise<boolean> {
  const { channelId, messageId, chatService } = event;
  const fleetLootRecord = await fetchFleetLootRecord(chatService, channelId, messageId);
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
    needsEditorUrl: `${webServerBaseUrl}/needs-editor/${chatService}/${channelId}/${messageId}/${encodeURIComponent(
      fleetMember
    )}`,
  }));
  return dispatchView({
    type: 'NeederChooserView',
    needsEditorLinks,
  });
}

export default updateOnWebNeederChooserRequested;
