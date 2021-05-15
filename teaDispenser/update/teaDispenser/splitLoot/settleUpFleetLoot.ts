import * as _ from 'lodash';
import FleetMember from '../../../data/FleetMember';
import FleetMemberLoot from '../../../data/FleetMemberLoot';
import Needs from '../../../data/Needs';
import PricedItemStack from '../../../data/PricedItemStack';
import SettledLoot from '../../../data/SettledLoot';
import splitItemsByNeeds from './splitItemsByNeeds';
import splitItemsByTargetValue from './splitItemsByTargetValue';

function settleUpFleetLoot(
  fleetMembers: readonly FleetMember[],
  itemStacks: readonly PricedItemStack[],
  needs: Needs
): SettledLoot {
  const items = itemStacks.flatMap(splitItemStack);
  const totalLootPrice = _.sumBy(items, ({ price }) => price);
  const totalWeight = _.sumBy(fleetMembers, ({ weight }) => weight);
  const lootPricePerUnitWeight = totalLootPrice / totalWeight;
  const lootAllocations = fleetMembers.map(({ name, weight }) => ({
    fleetMemberName: name,
    weight,
    targetValue: lootPricePerUnitWeight * weight,
    loot: [],
  }));
  const spareItems = splitItemsByNeeds(lootAllocations, items, needs);

  splitItemsByTargetValue(lootAllocations, spareItems, ({ price }) => price);

  const itemNames = itemStacks.map(({ name }) => name);
  const fleetMembersLoot: readonly FleetMemberLoot[] = lootAllocations.map(
    ({ fleetMemberName, weight, targetValue, loot }) => {
      const lootPrice = _.sumBy(loot, ({ price }) => price);
      const balance = lootPrice - targetValue;
      const payout = balance * payoutDiscount;
      return {
        fleetMemberName,
        loot: _.sortBy(stackItems(loot), ({ name }) => itemNames.indexOf(name)),
        lootPrice,
        weight,
        targetValue,
        balance,
        payout: _.round(payout, -6),
      };
    }
  );
  return {
    totalLootPrice,
    totalWeight,
    lootPricePerUnitWeight,
    averageLootPricePerMember: totalLootPrice / fleetMembersLoot.length,
    fleetMembersLoot,
    balanceClear: fleetMembersLoot.every(
      ({ lootPrice, balance, payout }) =>
        Math.abs(payout) < 10000000 && Math.abs(balance) / lootPrice < 0.1
    ),
    unequalSplit: 2 <= _.uniqBy(fleetMembersLoot, ({ weight }) => weight).length,
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
