import _ from 'lodash';
import Reader from '../../core/Reader/Reader';
import MessageContext from '../../data/MessageContext';
import dispatchView from '../../render/message/dispatchView';
import MessageRenderingContext from '../../render/message/MessageRenderingContext';
import settleUpFleetLoot from './splitLoot/settleUpFleetLoot';
import fleetLootRecordReader from './web/fleetLootRecordReader';

function updateOnTeaDispenserHandsUpButtonPressed(): Reader<
  MessageRenderingContext & MessageContext,
  boolean
> {
  return fleetLootRecordReader.bind((fleetLootRecord) => {
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
      settledLoot: settleUpFleetLoot(fleetMembers, itemStacks, needs),
      fleetLootRecordTitle,
    });
  });
}

export default updateOnTeaDispenserHandsUpButtonPressed;
