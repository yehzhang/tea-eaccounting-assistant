import _ from 'lodash';
import Item from '../../data/Item';
import LootAllocation from '../../data/LootAllocation';
import Needs from '../../data/Needs';
import findRandomMinValuedItem from './findRandomMinValuedItem';

/** Returns spare items. */
function splitItemsByNeeds<T extends Item>(
  lootAllocations: readonly LootAllocation<T>[],
  items: readonly T[],
  needs: Needs
): readonly T[] {
  const spareItems = [];
  for (const item of items) {
    const itemNeeds = needs.filter(({ item: { name } }) => name === item.name);
    const unmetAllocations = lootAllocations.filter(({ loot }, index) => {
      const suppliedAmount = countSuppliedAmountFromLoot(loot, item.name);
      const neededAmount = _.sumBy(
        itemNeeds.filter(({ needer }) => needer === lootAllocations[index].fleetMemberName),
        ({ item: { amount } }) => amount
      );
      return suppliedAmount < neededAmount;
    });
    const unmetAllocation = findRandomMinValuedItem(unmetAllocations, ({ loot }) =>
      countSuppliedAmountFromLoot(loot, item.name)
    );
    if (unmetAllocation) {
      unmetAllocation.loot.push(item);
    } else {
      spareItems.push(item);
    }
  }
  return spareItems;
}

function countSuppliedAmountFromLoot<T extends Item>(
  loot: readonly T[],
  neededItemName: string
): number {
  return loot.filter(({ name }) => name === neededItemName).length;
}

export default splitItemsByNeeds;
