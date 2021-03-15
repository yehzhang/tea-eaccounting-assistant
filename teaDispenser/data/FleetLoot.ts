import UserInputPricedItemStack from './UserInputPricedItemStack';

interface FleetLoot {
  readonly fleetMembers: readonly string[];
  readonly loot: readonly UserInputPricedItemStack[];
}

export default FleetLoot;
