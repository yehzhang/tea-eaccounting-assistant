import _ from 'lodash';
import DispatchView from '../data/DispatchView';
import { WebNeedsEditorRequestedEvent } from '../event/Event';
import WebPageView from '../view/webPage/WebPageView';
import areNeedsEditable from './areNeedsEditable';
import fetchFleetLootRecord from './fetchFleetLootRecord';

async function updateOnWebNeedsEditorRequested(
  event: WebNeedsEditorRequestedEvent,
  dispatchView: DispatchView<WebPageView>
): Promise<boolean> {
  const { channelId, messageId, needer, chatService } = event;
  const fleetLootRecord = await fetchFleetLootRecord(chatService, channelId, messageId);
  if (!fleetLootRecord) {
    return dispatchView({
      type: 'InvalidFleetLootRecordView',
    });
  }

  const { fleetLoot, needs } = fleetLootRecord;
  if (!areNeedsEditable(fleetLoot)) {
    return dispatchView({
      type: 'PendingFleetLootRecordView',
    });
  }

  const neederNeeds = needs.filter(({ needer: _needer }) => _needer === needer);
  return dispatchView({
    type: 'NeedsEditorView',
    itemStacks: _.uniq(fleetLoot.loot.map(({ name }) => name)).map((name) => ({
      name,
      amount: _.sumBy(
        neederNeeds.filter(({ item: { name: itemName } }) => itemName === name),
        ({ item: { amount } }) => amount
      ),
    })),
  });
}

export default updateOnWebNeedsEditorRequested;
