import Reader from '../../../core/Reader/Reader';
import MessageContext from '../../../data/MessageContext';
import { WebFleetLootEditorPostedEvent } from '../../../event/Event';
import dispatchView from '../../../render/webServer/dispatchView';
import WebServerRenderingContext from '../../../render/webServer/WebServerRenderingContext';
import updateFleetLootRecord from './updateFleetLootRecord';

function updateOnWebFleetLootEditorPosted(
  event: WebFleetLootEditorPostedEvent
): Reader<WebServerRenderingContext & MessageContext, boolean> {
  const { fleetLoot } = event;
  if (!fleetLoot) {
    return dispatchView({
      type: 'InvalidFleetLootEditorInputView',
    });
  }

  return updateFleetLootRecord((fleetLootRecord) => ({
    ...fleetLootRecord,
    fleetLoot,
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
    .mapContext((context) => ({ ...context, messageIdToEditRef: { current: event.messageId } }));
}

export default updateOnWebFleetLootEditorPosted;
