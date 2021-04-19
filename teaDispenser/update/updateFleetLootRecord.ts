import AsyncLock from 'async-lock';
import DispatchView from '../data/DispatchView';
import FleetLootRecord from '../data/FleetLootRecord';
import MessageApi from '../data/MessageApi';
import MessageServiceProvider from '../data/MessageServiceProvider';
import MessageView from '../view/message/MessageView';
import buildFleetLootRecordUpdatedView from './buildFleetLootRecordUpdatedView';
import fetchFleetLootRecord from './fetchFleetLootRecord';

async function updateFleetLootRecord(
  channelId: string,
  messageId: string,
  messageServiceProvider: MessageServiceProvider,
  messageApi: MessageApi,
  dispatchView: DispatchView<MessageView>,
  update: (fleetLootRecord: FleetLootRecord) => FleetLootRecord
): Promise<boolean> {
  return lock.acquire(`${messageServiceProvider}/${messageId}`, async () => {
    const fleetLootRecord = await fetchFleetLootRecord(messageApi, channelId, messageId);
    if (!fleetLootRecord) {
      return false;
    }

    // TODO collect the result to determine the return value.
    await dispatchView(
      buildFleetLootRecordUpdatedView(
        messageServiceProvider,
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
