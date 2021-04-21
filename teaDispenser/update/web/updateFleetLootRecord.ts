import AsyncLock from 'async-lock';
import ChatService from '../../data/ChatService';
import DispatchView from '../../data/DispatchView';
import FleetLootRecord from '../../data/FleetLootRecord';
import MessageView from '../../view/message/MessageView';
import buildFleetLootRecordUpdatedView from '../buildFleetLootRecordUpdatedView';
import fetchFleetLootRecord from './fetchFleetLootRecord';

async function updateFleetLootRecord(
  channelId: string,
  messageId: string,
  chatService: ChatService,
  dispatchView: DispatchView<MessageView>,
  update: (fleetLootRecord: FleetLootRecord) => FleetLootRecord
): Promise<boolean> {
  return lock.acquire(`${chatService}/${messageId}`, async () => {
    const fleetLootRecord = await fetchFleetLootRecord(
      chatService,
      channelId,
      messageId
    );
    if (!fleetLootRecord) {
      return false;
    }

    // TODO collect the result to determine the return value.
    await dispatchView(
      buildFleetLootRecordUpdatedView(
        chatService,
        update(fleetLootRecord),
        channelId,
        messageId
      )
    );

    return true;
  });
}

const lock = new AsyncLock();

export default updateFleetLootRecord;
