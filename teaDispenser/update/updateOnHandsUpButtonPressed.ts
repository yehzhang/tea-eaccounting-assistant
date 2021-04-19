import _ from 'lodash';
import DispatchView from '../data/DispatchView';
import { HandsUpButtonPressedEvent } from '../event/Event';
import MessageView from '../view/message/MessageView';
import settleUpFleetLoot from './splitLoot/settleUpFleetLoot';

function updateOnHandsUpButtonPressed(
  event: HandsUpButtonPressedEvent,
  dispatchView: DispatchView<MessageView>
): Promise<boolean> {
  const {
    fleetLoot: { fleetMembers, loot },
    fleetLootRecordTitle,
    needs,
  } = event;

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

export default updateOnHandsUpButtonPressed;
