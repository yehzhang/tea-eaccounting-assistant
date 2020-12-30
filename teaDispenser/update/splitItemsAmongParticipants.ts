import * as _ from 'lodash';

function splitItemsAmongParticipants<T extends object>(
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
}

export default splitItemsAmongParticipants;
