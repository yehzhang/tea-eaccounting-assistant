import * as _ from 'lodash';

export function splitItemsAmongParticipants<T extends object>(participantsItems: readonly (readonly T[])[], valueGetter: (item: T) => number): readonly (readonly T[])[] {
  const averageParticipantValue = _.sumBy(participantsItems.flat(), valueGetter) / participantsItems.length;
  let spareItemPool: T[] = [];
  return _.sortBy(
      participantsItems
          // Exclude the most valued item from future calculation for performance.
          .map(participantItems => {
            const [overpricedItems, regularItems] = _.partition(participantItems, item => averageParticipantValue <= valueGetter(item));
            const maxValueItem = _.maxBy(overpricedItems, valueGetter);
            if (maxValueItem) {
              spareItemPool.push(
                  ...overpricedItems.filter(item => item !== maxValueItem),
                  ...regularItems);
              return [maxValueItem];
            }
            return regularItems;
          })
          // Clear the balance for over valued participants.
          .map(participantItems => {
            if (_.sumBy(participantItems, valueGetter) <= averageParticipantValue) {
              return participantItems;
            }

            const remainingItems = findSubsetCloseToValue(participantItems, averageParticipantValue, valueGetter);
            spareItemPool.push(..._.difference(participantItems, remainingItems));

            return remainingItems;
          }),
      participantItems => _.sumBy(participantItems, valueGetter))
      // Most valued participants come first.
      .reverse()
      // Clear the balance for under valued participants.
      .map(participantItems => {
        const participantCredit = averageParticipantValue - _.sumBy(participantItems, valueGetter);
        if (participantCredit <= 0) {
          return participantItems;
        }

        const itemsToClearBalance = findSubsetCloseToValue(spareItemPool, participantCredit, valueGetter);
        spareItemPool = _.difference(spareItemPool, itemsToClearBalance);

        return participantItems.concat(itemsToClearBalance);
      });
}

function findSubsetCloseToValue<T>(set: readonly T[], targetValue: number, valueGetter: (item: T) => number): readonly T[] {
  const subsets = new Map<number, T>();
  let maxSubsetValue = -Infinity;
  for (const element of _.sortBy(set, valueGetter)) {
    const elementValue = valueGetter(element);
    const newSubsets = new Map([[elementValue, element]]);
    for (const subsetValue of subsets.keys()) {
      newSubsets.set(subsetValue + elementValue, element);
    }

    for (const [subsetValue, subsetElement] of newSubsets.entries()) {
      if (!subsets.has(subsetValue)) {
        subsets.set(subsetValue, subsetElement);
      }
    }

    const newSubsetValues = [...newSubsets.keys()];
    const newMaxSubsetValue = Math.max(...newSubsetValues);
    if (targetValue <= newMaxSubsetValue) {
      const minSubsetValueAboveTarget =
          Math.min(...newSubsetValues.filter(value => targetValue <= value));
      if (Math.abs(targetValue - minSubsetValueAboveTarget) <= Math.abs(targetValue - maxSubsetValue)) {
        maxSubsetValue = minSubsetValueAboveTarget;
      }
      break;
    }

    maxSubsetValue = newMaxSubsetValue;
  }

  const resultSubset = [];
  while (true) {
    const element = subsets.get(maxSubsetValue);
    if (!element) {
      break;
    }
    resultSubset.push(element);
    maxSubsetValue -= valueGetter(element);
  }

  return resultSubset;
}

export const TEST_ONLY = { findSubsetCloseToValue };
