import DispatchView from '../../data/DispatchView';
import { WebFleetLootEditorPostedEvent } from '../../event/Event';
import MessageView from '../../view/message/MessageView';
import WebPageView from '../../view/webPage/WebPageView';
import updateFleetLootRecord from './updateFleetLootRecord';

async function updateOnWebFleetLootEditorPosted(
  event: WebFleetLootEditorPostedEvent,
  dispatchWebPageView: DispatchView<WebPageView>,
  dispatchMessageView: DispatchView<MessageView>,
): Promise<boolean> {
  const { messageId, channelId, fleetLoot, chatService } = event;
  if (!fleetLoot) {
    return dispatchWebPageView({
      type: 'InvalidFleetLootEditorInputView',
    });
  }

  const success = await updateFleetLootRecord(
    channelId,
    messageId,
    chatService,
    dispatchMessageView,
    (fleetLootRecord) => ({ ...fleetLootRecord, fleetLoot })
  );
  return dispatchWebPageView(
    success
      ? {
          type: 'UpdatedConfirmationView',
        }
      : {
          type: 'InvalidFleetLootRecordView',
        }
  );
}

export default updateOnWebFleetLootEditorPosted;
