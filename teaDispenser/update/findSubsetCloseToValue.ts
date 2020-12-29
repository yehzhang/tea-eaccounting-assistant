import * as _ from 'lodash';

function findSubsetCloseToValue<T>(set: readonly T[], targetValue: number, valueGetter: (item: T) => number): readonly T[] {
  const subsets = new Map<number, T>();
  let optimalSubsetValue = -Infinity;
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
    const minNewSubsetValue = Math.min(...newSubsetValues);
    if (targetValue <= minNewSubsetValue) {
      // If the minimum new subset value is greater than the target, all remaining subset values
      // must be even greater, so no need to search further.
      if (Math.abs(targetValue - minNewSubsetValue) <= Math.abs(targetValue - optimalSubsetValue)) {
        optimalSubsetValue = minNewSubsetValue;
      }
      break;
    }

    newSubsetValues.push(optimalSubsetValue);
    optimalSubsetValue = _.minBy(newSubsetValues, (value) => Math.abs(value - targetValue))!;
    if (targetValue * 0.99 <= optimalSubsetValue && optimalSubsetValue <= targetValue * 1.01) {
      break;
    }
  }

  const resultSubset = [];
  while (true) {
    const element = subsets.get(optimalSubsetValue);
    if (!element) {
      if (optimalSubsetValue && optimalSubsetValue !== -Infinity) {
        console.error('Unexpected subset value', optimalSubsetValue);
      }
      return resultSubset;
    }
    resultSubset.push(element);
    optimalSubsetValue -= valueGetter(element);
  }
}

export default findSubsetCloseToValue;
