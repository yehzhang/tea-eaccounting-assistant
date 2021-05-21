import _ from 'lodash';
import EventContext from '../../core/EventContext';
import Reader from '../../core/Reader/Reader';
import FleetLootRecord from '../../data/FleetLootRecord';
import MessageContext from '../../data/MessageContext';
import { TeaDispenserKiwiButtonPressedEvent } from '../../event/Event';
import dispatchView from '../../render/message/dispatchView';
import OneShotDuplex from './OneShotDuplex';
import fleetLootRecordReader from './web/fleetLootRecordReader';
import overwriteFleetLootRecord from './web/overwriteFleetLootRecord';

function updateOnTeaDispenserKiwiButtonPressed(
  event: TeaDispenserKiwiButtonPressedEvent
): Reader<EventContext & MessageContext, boolean> {
  const { triggeringUserId, messageId } = event;
  return fleetLootRecordReader
    .bind(async (fleetLootRecord) => {
      if (!fleetLootRecord) {
        return false;
      }
      const otherRecord = await fleetLootRecordDuplex.connect(
        triggeringUserId,
        fleetLootRecord,
        /* timeoutMs= */ 30000
      );
      if (!otherRecord || fleetLootRecord.id === otherRecord.id) {
        return true;
      }

      if (fleetLootRecord.createdAt < otherRecord.createdAt) {
        return dispatchView({ type: 'DeletedView' });
      }

      return overwriteFleetLootRecord({
        ...fleetLootRecord,
        fleetLoot: {
          fleetMembers: _.uniq(
            otherRecord.fleetLoot.fleetMembers.concat(fleetLootRecord.fleetLoot.fleetMembers)
          ),
          loot: otherRecord.fleetLoot.loot.concat(fleetLootRecord.fleetLoot.loot),
        },
        needs: otherRecord.needs.concat(fleetLootRecord.needs),
      });
    })
    .mapContext((context) => ({ ...context, messageIdToEditRef: { current: messageId } }));
}

const fleetLootRecordDuplex = new OneShotDuplex<FleetLootRecord>();

export default updateOnTeaDispenserKiwiButtonPressed;
