import DispatchView from '../data/DispatchView';
import MessageApi from '../data/MessageApi';
import { WebNeedsEditorPostedEvent } from '../event/Event';
import MessageView from '../view/message/MessageView';
import WebPageView from '../view/webPage/WebPageView';
import updateFleetLootRecord from './updateFleetLootRecord';

async function updateOnWebNeedsEditorPosted(
  event: WebNeedsEditorPostedEvent,
  dispatchWebPageView: DispatchView<WebPageView>,
  dispatchMessageView: DispatchView<MessageView>,
  messageApi: MessageApi
): Promise<boolean> {
  const { channelId, messageId, needer, itemStacks, messageServiceProvider } = event;
  const success = await updateFleetLootRecord(
    channelId,
    messageId,
    messageServiceProvider,
    messageApi,
    dispatchMessageView,
    (fleetLootRecord) => ({
      ...fleetLootRecord,
      needs: fleetLootRecord.needs
        .filter(({ needer: _needer }) => _needer !== needer)
        .concat(itemStacks.map((item) => ({ needer, item }))),
    })
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

export default updateOnWebNeedsEditorPosted;
