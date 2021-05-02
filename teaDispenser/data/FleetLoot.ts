import FleetMember from './FleetMember';
import UserInputPricedItemStack from './UserInputPricedItemStack';

interface FleetLoot {
  readonly fleetMembers: readonly FleetMember[];
  readonly loot: readonly UserInputPricedItemStack[];
}

export default FleetLoot;
