import * as _ from 'lodash';

function splitItemsAmongParticipants<T extends object>(
  participantsItems: readonly (readonly T[])[],
  spareItems: readonly T[],
  valueGetter: (item: T) => number
): readonly (readonly T[])[] {
  if (!participantsItems.length) {
    return participantsItems;
  }

  const participantQueue = participantsItems.map((participantItems) => participantItems.slice());
  for (const item of _.sortBy(spareItems, valueGetter).reverse()) {
    // Randomly pick a participant in case more than one are the least valued.
    const minParticipantValue = Math.min(
      ...participantQueue.map((participantItems) => _.sumBy(participantItems, valueGetter))
    );
    const minValuedParticipant = _.sample(
      participantQueue.filter(
        (participantItems) => _.sumBy(participantItems, valueGetter) === minParticipantValue
      )
    )!;
    minValuedParticipant.push(item);
  }

  return participantQueue;
}

export default splitItemsAmongParticipants;
