import * as _ from 'lodash';

export function splitItemsAmongParticipants<T extends object>(
    participantsItems: readonly (readonly T[])[],
    spareItems: readonly T[],
    valueGetter: (item: T) => number,
): readonly (readonly T[])[] {
  if (!participantsItems.length) {
    return participantsItems;
  }

  const participantQueue = participantsItems.map(participantItems => participantItems.slice());
  for (const item of _.sortBy(spareItems, valueGetter).reverse()) {
    const minValuedParticipant = _.minBy(participantQueue, (participantItems) => _.sumBy(participantItems, valueGetter))!;
    minValuedParticipant.push(item);
  }

  return participantQueue;

  // Legacy impl: finds the optimal solution for as many gainedParticipants as possible, but performs
  // poorly for the rest gainedParticipants in the worst case. Works well if cash transfer is allowed
  // in which case the amount of transfers is minimized. However, we almost never do cash transfers,
  // do we?
  // const averageParticipantValue = _.sumBy([...participantsItems, spareItems].flat(), valueGetter) /
  //     participantsItems.length;
  // let spareItemPool = [...spareItems];
  // return _.sortBy(participantsItems, participantItems => _.sumBy(participantItems, valueGetter))
  //     // Most valued gainedParticipants come first.
  //     .reverse()
  //     // Clear the balance for each participant.
  //     .map(participantItems => {
  //       const participantCredit = averageParticipantValue - _.sumBy(participantItems, valueGetter);
  //       if (participantCredit <= 0) {
  //         return participantItems;
  //       }
  //
  //       const itemsToClearBalance = findSubsetCloseToValue(spareItemPool, participantCredit, valueGetter);
  //       spareItemPool = _.difference(spareItemPool, itemsToClearBalance);
  //
  //       return participantItems.concat(itemsToClearBalance);
  //     });
}
