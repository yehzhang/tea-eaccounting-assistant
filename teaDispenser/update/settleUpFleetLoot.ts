import * as _ from 'lodash';
import FleetMemberLoot from '../data/FleetMemberLoot';
import Needs from '../data/Needs';
import PricedItemStack from '../data/PricedItemStack';
import splitItemsAmongParticipants from './splitItemsAmongParticipants';
import splitItemsByNeeds from './splitItemsByNeeds';

function settleUpFleetLoot(
  fleetMembers: readonly string[],
  itemStacks: readonly PricedItemStack[],
  needs: Needs
): readonly FleetMemberLoot[] {
  const items = itemStacks.flatMap(splitItemStack);
  const { fleetMembersLoot, spareItems } = splitItemsByNeeds(fleetMembers, items, needs);

  const settledUpLoot = splitItemsAmongParticipants(
    fleetMembersLoot,
    spareItems,
    ({ price }) => price
  );

  return _.zipWith(settledUpLoot, fleetMembers, (loot, fleetMemberName) => ({
    fleetMemberName,
    // Stack items.
    loot: Object.values(_.groupBy(loot, ({ name }) => name)).map((itemGroup) => ({
      name: itemGroup[0].name,
      amount: itemGroup.length,
      price: itemGroup[0].price,
    })),
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

export default settleUpFleetLoot;
