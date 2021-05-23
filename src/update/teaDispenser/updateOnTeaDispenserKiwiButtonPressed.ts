import _ from 'lodash';
import Reader from '../../core/Reader/Reader';
import FleetLootRecord from '../../data/FleetLootRecord';
import FleetMember from '../../data/FleetMember';
import MessageContext from '../../data/MessageContext';
import { TeaDispenserKiwiButtonPressedEvent } from '../../event/Event';
import dispatchView from '../../render/message/dispatchView';
import MessageRenderingContext from '../../render/message/MessageRenderingContext';
import OneShotDuplex from './OneShotDuplex';
import fleetLootRecordReader from './web/fleetLootRecordReader';
import overwriteFleetLootRecord from './web/overwriteFleetLootRecord';

function updateOnTeaDispenserKiwiButtonPressed(
  event: TeaDispenserKiwiButtonPressedEvent
): Reader<MessageRenderingContext & MessageContext, boolean> {
  const { triggeringUserId, messageId } = event;
  return fleetLootRecordReader.bind(async (fleetLootRecord) => {
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

    const mergedFleetMembers = mergeFleetMembers(
      otherRecord.fleetLoot.fleetMembers,
      fleetLootRecord.fleetLoot.fleetMembers
    );
    const olderRecord = fleetLootRecord.createdAt < otherRecord.createdAt;
    if (!mergedFleetMembers) {
      if (olderRecord) {
        return true;
      }
      return dispatchView({ type: 'IncompatibleFleetMembersView' });
    }

    return new Reader((context) => {
      context.messageIdToEditRef.current = messageId;

      if (olderRecord) {
        return dispatchView({ type: 'DeletedView' });
      }

      return overwriteFleetLootRecord({
        ...fleetLootRecord,
        fleetLoot: {
          fleetMembers: mergedFleetMembers,
          loot: otherRecord.fleetLoot.loot.concat(fleetLootRecord.fleetLoot.loot),
        },
        needs: otherRecord.needs.concat(fleetLootRecord.needs),
      });
    });
  });
}

const fleetLootRecordDuplex = new OneShotDuplex<FleetLootRecord>();

function mergeFleetMembers(
  others: readonly FleetMember[],
  fleetMembers: readonly FleetMember[]
): readonly FleetMember[] | null {
  if (!fleetMembers.length) {
    return others;
  }
  if (!others.length) {
    return fleetMembers;
  }

  const fleetMembersId = getFleetMembersId(fleetMembers);
  const otherFleetMembersId = getFleetMembersId(others);
  return _.isEqual(fleetMembersId, otherFleetMembersId) ? fleetMembers : null;
}

function getFleetMembersId(
  fleetMembers: readonly FleetMember[]
): { readonly [fleetMemberName: string]: number } {
  const minWeight = Math.min(...fleetMembers.map(({ weight }) => weight));
  return Object.assign(
    {},
    ...fleetMembers.map(({ name, weight }) => ({ [name]: weight / minWeight }))
  );
}

export default updateOnTeaDispenserKiwiButtonPressed;
