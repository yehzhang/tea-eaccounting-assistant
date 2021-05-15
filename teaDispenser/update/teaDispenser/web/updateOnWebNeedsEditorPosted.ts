import Reader from '../../../core/Reader/Reader';
import MessageContext from '../../../data/MessageContext';
import { WebNeedsEditorPostedEvent } from '../../../event/Event';
import dispatchView from '../../../render/webServer/dispatchView';
import WebServerRenderingContext from '../../../render/webServer/WebServerRenderingContext';
import updateFleetLootRecord from './updateFleetLootRecord';

function updateOnWebNeedsEditorPosted(
  event: WebNeedsEditorPostedEvent
): Reader<WebServerRenderingContext & MessageContext, boolean> {
  const { needer, itemStacks, messageId } = event;
  return updateFleetLootRecord((fleetLootRecord) => ({
    ...fleetLootRecord,
    needs: fleetLootRecord.needs
      .filter(({ needer: _needer }) => _needer !== needer)
      .concat(itemStacks.map((item) => ({ needer, item }))),
  }))
    .bind((success) =>
      dispatchView(
        success
          ? {
              type: 'UpdatedConfirmationView',
            }
          : {
              type: 'InvalidFleetLootRecordView',
            }
      )
    )
    .mapContext((context) => ({
      ...context,
      messageIdToEditRef: { current: messageId },
    }));
}

export default updateOnWebNeedsEditorPosted;
