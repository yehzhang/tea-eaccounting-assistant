import _ from 'lodash';
import DispatchView from '../../data/DispatchView';
import { TeaDispenserHandsUpButtonPressedEvent } from '../../event/Event';
import MessageView from '../../view/message/MessageView';
import settleUpFleetLoot from '../splitLoot/settleUpFleetLoot';
import fetchFleetLootRecord from '../web/fetchFleetLootRecord';

async function updateOnTeaDispenserHandsUpButtonPressed(
  event: TeaDispenserHandsUpButtonPressedEvent,
  dispatchView: DispatchView<MessageView>
): Promise<boolean> {
  const { channelId, buttonAssociatedMessageId, chatService } = event;
  const fleetLootRecord = await fetchFleetLootRecord(
    chatService,
    channelId,
    buttonAssociatedMessageId
  );
  if (!fleetLootRecord) {
    return false;
  }

  const {
    fleetLoot: { fleetMembers, loot },
    title: fleetLootRecordTitle,
    needs,
  } = fleetLootRecord;
  if (!fleetMembers.length) {
    return dispatchView({
      type: 'NoFleetMemberToSettleUpView',
    });
  }

  const itemStacks = _.compact(
    loot.map(({ name, amount, price }) =>
      !name || amount === null || price === null ? null : { name, amount, price }
    )
  );
  if (itemStacks.length !== loot.length) {
    return dispatchView({
      type: 'NoFleetMemberToSettleUpView',
    });
  }

  return dispatchView({
    type: 'FleetMembersSettledUpView',
    ...settleUpFleetLoot(fleetMembers, itemStacks, needs),
    fleetLootRecordTitle,
  });
}

export default updateOnTeaDispenserHandsUpButtonPressed;
