import * as _ from 'lodash';
import { ItemChecklistEntry } from '../data/itemChecklistEntry';
import { getTotalPrice } from '../state/getTotalPrice';
import { ItemTransition } from '../state/state';
import { splitItemsAmongParticipants } from './splitItemsAmongParticipants';

export function settleUpParticipants(participantsItems: readonly (readonly ItemChecklistEntry[])[]): readonly ItemTransition[] {
  const participantsSplitItems = participantsItems.map((entries) =>
      entries.flatMap(({ name, price, amount }) =>
          Array(amount).fill(null).map(() => ({
            name,
            price,
            amount: 1,
          }))));
  const clearedParticipantsItems = splitItemsAmongParticipants(participantsSplitItems, ({ price }) => price);
  const itemTransitions = _.zip(participantsSplitItems, clearedParticipantsItems)
      .flatMap(([beforeParticipant, afterParticipant], index) =>
          afterParticipant!
              .map(entry => ({
                sourceParticipantIndex: participantsSplitItems.findIndex(participant => participant.includes(entry)),
                targetParticipantIndex: index,
                entry,
              })));
  const stackedItemTransitions = Object.values(
      _.groupBy(
          itemTransitions,
          ({ sourceParticipantIndex, targetParticipantIndex, entry: { name } }) =>
              `${sourceParticipantIndex}:${targetParticipantIndex}:${name}`))
      .map((itemTransitions) => ({
            ...itemTransitions[0],
            entry: {
              ...itemTransitions[0].entry,
              amount: itemTransitions.length,
            },
          }),
      );
  return stackedItemTransitions.concat(getIskTransitions(clearedParticipantsItems));
}

function getIskTransitions(participantsItems: readonly (readonly ItemChecklistEntry[])[]): readonly ItemTransition[] {
  const averageParticipantGain = getTotalPrice(participantsItems.flat()) / participantsItems.length;
  const participantDebts = participantsItems.map((participant) => ({
    current: getTotalPrice(participant) - averageParticipantGain,
  }));
  return participantDebts.flatMap((sourceParticipantDebt, sourceParticipantIndex) => {
    if (sourceParticipantDebt.current <= 0) {
      return [];
    }
    return _.compact(participantDebts.map((targetParticipantDebt, targetParticipantIndex) => {
      if (0 <= targetParticipantDebt.current) {
        return null;
      }

      const transferAmount =
          Math.min(sourceParticipantDebt.current, Math.abs(targetParticipantDebt.current));
      sourceParticipantDebt.current -= transferAmount;
      targetParticipantDebt.current += transferAmount;

      return {
        sourceParticipantIndex,
        targetParticipantIndex,
        entry: {
          name: 'ISK',
          price: 1,
          amount: transferAmount,
        },
      };
    }));
  });
}
