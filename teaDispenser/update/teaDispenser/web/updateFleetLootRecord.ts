import AsyncLock from 'async-lock';
import Reader from '../../../core/Reader/Reader';
import FleetLootRecord from '../../../data/FleetLootRecord';
import MessageContext from '../../../data/MessageContext';
import MessageRenderingContext from '../../../render/message/MessageRenderingContext';
import fleetLootRecordReader from './fleetLootRecordReader';
import overwriteFleetLootRecord from './overwriteFleetLootRecord';

/** Not guaranteed to be atomic when `overwriteFleetLootRecord()` is used elsewhere. */
function updateFleetLootRecord(
  update: (fleetLootRecord: FleetLootRecord) => FleetLootRecord
): Reader<MessageRenderingContext & MessageContext, boolean> {
  return new Reader((context) =>
    lock.acquire(`${context.chatService}/${context.messageId}`, () =>
      fleetLootRecordReader
        .bind((fleetLootRecord) =>
          fleetLootRecord ? overwriteFleetLootRecord(update(fleetLootRecord)) : false
        )
        .run(context)
    )
  );
}

const lock = new AsyncLock();

export default updateFleetLootRecord;
