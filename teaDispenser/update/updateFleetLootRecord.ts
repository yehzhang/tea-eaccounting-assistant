import AsyncLock from 'async-lock';
import { nanoid } from 'nanoid';
import chooseMessageApi from '../chooseMessageApi';
import DispatchView from '../data/DispatchView';
import FleetLootRecord from '../data/FleetLootRecord';
import MessageEventContext from '../data/MessageEventContext';
import ExternalDependency from '../ExternalDependency';
import MessageView from '../view/message/MessageView';
import buildFleetLootRecordUpdatedView from './buildFleetLootRecordUpdatedView';
import fetchFleetLootRecord from './fetchFleetLootRecord';

async function updateFleetLootRecord(
  channelId: string,
  messageId: string,
  messageServiceProvider: 'discord' | 'kaiheila',
  externalDependency: ExternalDependency,
  dispatchView: DispatchView<MessageView, MessageEventContext, [ExternalDependency]>,
  update: (fleetLootRecord: FleetLootRecord) => FleetLootRecord
): Promise<boolean> {
  return lock.acquire(`${messageServiceProvider}/${messageId}`, async () => {
    const fleetLootRecord = await fetchFleetLootRecord(
      chooseMessageApi(messageServiceProvider, externalDependency),
      channelId,
      messageId
    );
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
      ),
      {
        eventId: nanoid(),
        serviceProvider: messageServiceProvider,
        channelId,
        messageIdToEdit: messageId
      },
      externalDependency
    );

    return true;
  });
}

const lock = new AsyncLock();

export default updateFleetLootRecord;
