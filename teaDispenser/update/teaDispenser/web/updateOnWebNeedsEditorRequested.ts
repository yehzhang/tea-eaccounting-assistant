import _ from 'lodash';
import Reader from '../../../core/Reader/Reader';
import MessageContext from '../../../data/MessageContext';
import { WebNeedsEditorRequestedEvent } from '../../../event/Event';
import MessageRenderingContext from '../../../render/message/MessageRenderingContext';
import dispatchView from '../../../render/webServer/dispatchView';
import WebServerRenderingContext from '../../../render/webServer/WebServerRenderingContext';
import areNeedsEditable from './areNeedsEditable';
import fleetLootRecordReader from './fleetLootRecordReader';

function updateOnWebNeedsEditorRequested(
  event: WebNeedsEditorRequestedEvent
): Reader<WebServerRenderingContext & MessageRenderingContext & MessageContext, boolean> {
  const { needer } = event;
  return fleetLootRecordReader.bind((fleetLootRecord) => {
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
  });
}

export default updateOnWebNeedsEditorRequested;
