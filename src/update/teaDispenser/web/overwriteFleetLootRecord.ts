import Reader from '../../../core/Reader/Reader';
import FleetLootRecord from '../../../data/FleetLootRecord';
import MessageContext from '../../../data/MessageContext';
import dispatchView from '../../../render/message/dispatchView';
import MessageRenderingContext from '../../../render/message/MessageRenderingContext';
import MessageView from '../../../render/message/view/MessageView';
import getFleetLootEditorUrl from '../getFleetLootEditorUrl';
import getNeederChooserUrl from '../getNeederChooserUrl';

function overwriteFleetLootRecord(
  fleetLootRecord: FleetLootRecord
): Reader<MessageRenderingContext & MessageContext, boolean> {
  return new Reader(
    (context: MessageContext): MessageView => ({
      type: 'FleetLootRecordUpdatedView',
      ...fleetLootRecord,
      fleetLootEditorUrl: getFleetLootEditorUrl(context),
      neederChooserUrl: getNeederChooserUrl(context),
    })
  ).bind(dispatchView);
}

export default overwriteFleetLootRecord;
