import * as _ from 'lodash';
import FleetMemberLoot from '../data/FleetMemberLoot';
import Needs from '../data/Needs';
import PricedItemStack from '../data/PricedItemStack';
import splitItemsAmongFleetMembers from './splitItemsAmongFleetMembers';
import splitItemsByNeeds from './splitItemsByNeeds';

function settleUpFleetLoot(
  fleetMembers: readonly string[],
  itemStacks: readonly PricedItemStack[],
  needs: Needs
): readonly FleetMemberLoot[] {
  const items = itemStacks.flatMap(splitItemStack);
  const { fleetMembersLoot, spareItems } = splitItemsByNeeds(fleetMembers, items, needs);

  const settledUpLoot = splitItemsAmongFleetMembers(
    fleetMembersLoot,
    spareItems,
    ({ price }) => price
  );

  const itemNames = itemStacks.map(({ name }) => name);
  return _.zipWith(settledUpLoot, fleetMembers, (loot, fleetMemberName) => ({
    fleetMemberName,
    loot: _.sortBy(stackItems(loot), ({ name }) => itemNames.indexOf(name)),
  }));
}

function splitItemStack({ name, amount, price }: PricedItemStack): readonly PricedItemStack[] {
  return Array(amount)
    .fill(null)
    .map(() => ({
      name,
      amount: 1,
      price,
    }));
}

function stackItems(items: readonly PricedItemStack[]): readonly PricedItemStack[] {
  return Object.values(_.groupBy(items, ({ name }) => name)).map((itemGroup) => ({
    name: itemGroup[0].name,
    amount: _.sumBy(itemGroup, ({ amount }) => amount),
    price: itemGroup[0].price,
  }));
}

export default settleUpFleetLoot;
