import * as _ from 'lodash';
import findRandomMinValuedItem from './findRandomMinValuedItem';

function splitItemsAmongFleetMembers<T>(
  participantsItems: readonly (readonly T[])[],
  spareItems: readonly T[],
  valueGetter: (item: T) => number
): readonly (readonly T[])[] {
  if (!participantsItems.length) {
    return participantsItems;
  }

  const participantQueue = participantsItems.map((participantItems) => participantItems.slice());
  for (const item of _.sortBy(spareItems, valueGetter).reverse()) {
    const minValuedParticipant = findRandomMinValuedItem(participantQueue, (participantItems) =>
      _.sumBy(participantItems, valueGetter)
    )!;
    minValuedParticipant.push(item);
  }

  return participantQueue;
}

export default splitItemsAmongFleetMembers;
