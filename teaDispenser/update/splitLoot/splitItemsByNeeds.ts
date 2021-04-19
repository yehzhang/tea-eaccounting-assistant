import _ from 'lodash';
import Item from '../../data/Item';
import Needs from '../../data/Needs';
import findRandomMinValuedItem from './findRandomMinValuedItem';

function splitItemsByNeeds<T extends Item>(
  fleetMembers: readonly string[],
  items: readonly T[],
  needs: Needs
): {
  readonly fleetMembersLoot: readonly (readonly T[])[];
  readonly spareItems: readonly T[];
} {
  const fleetMembersLoot: readonly T[][] = fleetMembers.map(() => []);
  const spareItems = [];
  for (const item of items) {
    const itemNeeds = needs.filter(({ item: { name } }) => name === item.name);
    const unmetNeedersLoot = fleetMembersLoot.filter((loot, index) => {
      const suppliedAmount = countSuppliedAmountFromLoot(loot, item.name);
      const neededAmount = _.sumBy(
        itemNeeds.filter(({ needer }) => needer === fleetMembers[index]),
        ({ item: { amount } }) => amount
      );
      return suppliedAmount < neededAmount;
    });
    const neederLootToSupply = findRandomMinValuedItem(unmetNeedersLoot, (loot) =>
      countSuppliedAmountFromLoot(loot, item.name)
    );
    if (neederLootToSupply) {
      neederLootToSupply.push(item);
    } else {
      spareItems.push(item);
    }
  }

  return {
    fleetMembersLoot,
    spareItems,
  };
}

function countSuppliedAmountFromLoot<T extends Item>(
  loot: readonly T[],
  neededItemName: string
): number {
  return loot.filter(({ name }) => name === neededItemName).length;
}

export default splitItemsByNeeds;
