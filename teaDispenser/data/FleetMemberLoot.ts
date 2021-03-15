import PricedItemStack from './PricedItemStack';

interface FleetMemberLoot {
  readonly fleetMemberName: string;
  readonly loot: readonly PricedItemStack[];
}

export default FleetMemberLoot;
