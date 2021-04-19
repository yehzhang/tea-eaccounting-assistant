import _ from 'lodash';
import DispatchView from '../data/DispatchView';
import FleetLootRecord from '../data/FleetLootRecord';
import { KiwiButtonPressedEvent } from '../event/Event';
import MessageView from '../view/message/MessageView';
import buildFleetLootRecordUpdatedView from './buildFleetLootRecordUpdatedView';
import OneShotDuplex from './OneShotDuplex';

async function updateOnKiwiButtonPressed(
  event: KiwiButtonPressedEvent,
  dispatchView: DispatchView<MessageView>
): Promise<boolean> {
  const {
    fleetLootRecord,
    userId,
    messageServiceProvider,
    channelId,
    buttonAssociatedMessageId,
  } = event;
  const otherRecord = await fleetLootRecordDuplex.connect(
    userId,
    fleetLootRecord,
    /* timeoutMs= */ 30000
  );
  if (!otherRecord || fleetLootRecord.id === otherRecord.id) {
    return true;
  }

  if (fleetLootRecord.createdAt < otherRecord.createdAt) {
    return dispatchView({ type: 'DeletedView' });
  }

  return dispatchView(
    buildFleetLootRecordUpdatedView(
      messageServiceProvider,
      {
        ...fleetLootRecord,
        fleetLoot: {
          fleetMembers: _.uniq(
            otherRecord.fleetLoot.fleetMembers.concat(fleetLootRecord.fleetLoot.fleetMembers)
          ),
          loot: otherRecord.fleetLoot.loot.concat(fleetLootRecord.fleetLoot.loot),
        },
        needs: otherRecord.needs.concat(fleetLootRecord.needs),
      },
      channelId,
      buttonAssociatedMessageId
    )
  );
}

const fleetLootRecordDuplex = new OneShotDuplex<FleetLootRecord>();

export default updateOnKiwiButtonPressed;
