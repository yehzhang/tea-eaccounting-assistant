import * as _ from 'lodash';
import FleetMemberLoot from '../../data/FleetMemberLoot';
import Needs from '../../data/Needs';
import PricedItemStack from '../../data/PricedItemStack';
import splitItemsAmongFleetMembers from './splitItemsAmongFleetMembers';
import splitItemsByNeeds from './splitItemsByNeeds';

function settleUpFleetLoot(
  fleetMembers: readonly string[],
  itemStacks: readonly PricedItemStack[],
  needs: Needs
): {
  readonly totalLootPrice: number;
  readonly averageLootPricePerMember: number;
  readonly fleetMembersLoot: readonly FleetMemberLoot[];
  readonly balanceClear: boolean;
} {
  const items = itemStacks.flatMap(splitItemStack);
  const totalLootPrice = _.sumBy(items, ({ price }) => price);
  const { fleetMembersLoot, spareItems } = splitItemsByNeeds(fleetMembers, items, needs);

  const settledLoot = splitItemsAmongFleetMembers(
    fleetMembersLoot,
    spareItems,
    ({ price }) => price
  );

  const itemNames = itemStacks.map(({ name }) => name);
  const averageLootPricePerMember = totalLootPrice / fleetMembers.length;
  const settledFleetMembersLoot = _.zipWith(settledLoot, fleetMembers, (loot, fleetMemberName) => {
    const lootPrice = _.sumBy(loot, ({ price }) => price);
    const balance = lootPrice - averageLootPricePerMember;
    const payout = balance * payoutDiscount;
    return {
      fleetMemberName,
      loot: _.sortBy(stackItems(loot), ({ name }) => itemNames.indexOf(name)),
      lootPrice,
      balance,
      payout: _.round(payout, -6),
    };
  });
  return {
    totalLootPrice,
    averageLootPricePerMember,
    fleetMembersLoot: settledFleetMembersLoot,
    balanceClear: settledFleetMembersLoot.every(
      ({ lootPrice, balance, payout }) =>
        Math.abs(payout) < 10000000 && Math.abs(balance) / lootPrice < 0.1
    ),
  };
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

const payoutDiscount = 0.75;

export default settleUpFleetLoot;
