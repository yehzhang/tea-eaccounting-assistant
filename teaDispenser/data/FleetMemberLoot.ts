import PricedItemStack from './PricedItemStack';

interface FleetMemberLoot {
  readonly fleetMemberName: string;
  readonly loot: readonly PricedItemStack[];
  readonly lootPrice: number;
  readonly balance: number;
  readonly payout: number;
}

export default FleetMemberLoot;
