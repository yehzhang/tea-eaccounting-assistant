import * as _ from 'lodash';
import LootAllocation from '../../data/LootAllocation';
import findRandomMinValuedItem from './findRandomMinValuedItem';

function splitItemsByTargetValue<T>(
  lootAllocations: readonly LootAllocation<T>[],
  spareItems: readonly T[],
  valueGetter: (item: T) => number
): void {
  const allocationQueue: LootAllocation<T>[] = lootAllocations.slice();
  for (const item of _.sortBy(spareItems, valueGetter).reverse()) {
    const mostUnderValuedAllocation = findRandomMinValuedItem(
      allocationQueue,
      ({ loot, targetValue }) => _.sumBy(loot, valueGetter) - targetValue
    );
    if (mostUnderValuedAllocation) {
      mostUnderValuedAllocation.loot.push(item);
    }
  }
}

export default splitItemsByTargetValue;
