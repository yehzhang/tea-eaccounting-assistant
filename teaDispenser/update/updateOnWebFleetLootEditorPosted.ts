import DispatchView from '../data/DispatchView';
import MessageApi from '../data/MessageApi';
import MessageEventContext from '../data/MessageEventContext';
import { WebFleetLootEditorPostedEvent } from '../event/Event';
import MessageView from '../view/message/MessageView';
import WebPageView from '../view/webPage/WebPageView';
import updateFleetLootRecord from './updateFleetLootRecord';

async function updateOnWebFleetLootEditorPosted(
  event: WebFleetLootEditorPostedEvent,
  dispatchWebPageView: DispatchView<WebPageView>,
  dispatchMessageView: DispatchView<MessageView, [MessageEventContext]>,
  messageApi: MessageApi
): Promise<boolean> {
  const { messageId, channelId, fleetLoot, messageServiceProvider } = event;
  if (!fleetLoot) {
    return dispatchWebPageView({
      type: 'InvalidFleetLootEditorInputView',
    });
  }

  const success = await updateFleetLootRecord(
    channelId,
    messageId,
    messageServiceProvider,
    messageApi,
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
