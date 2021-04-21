import _ from 'lodash';
import DispatchView from '../../data/DispatchView';
import FleetLootRecord from '../../data/FleetLootRecord';
import { TeaDispenserKiwiButtonPressedEvent } from '../../event/Event';
import MessageView from '../../view/message/MessageView';
import buildFleetLootRecordUpdatedView from '../buildFleetLootRecordUpdatedView';
import fetchFleetLootRecord from '../web/fetchFleetLootRecord';
import OneShotDuplex from './OneShotDuplex';

async function updateOnTeaDispenserKiwiButtonPressed(
  event: TeaDispenserKiwiButtonPressedEvent,
  dispatchView: DispatchView<MessageView>
): Promise<boolean> {
  const { userId, chatService, channelId, buttonAssociatedMessageId } = event;
  const fleetLootRecord = await fetchFleetLootRecord(
    chatService,
    channelId,
    buttonAssociatedMessageId
  );
  if (!fleetLootRecord) {
    return false;
  }

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
      chatService,
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

export default updateOnTeaDispenserKiwiButtonPressed;
