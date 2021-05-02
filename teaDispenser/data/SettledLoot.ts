import FleetMemberLoot from './FleetMemberLoot';

interface SettledLoot {
  readonly totalLootPrice: number;
  readonly averageLootPricePerMember: number;
  readonly totalWeight: number;
  readonly lootPricePerUnitWeight: number,
  readonly fleetMembersLoot: readonly FleetMemberLoot[];
  readonly balanceClear: boolean;
  readonly unequalSplit: boolean;
}

export default SettledLoot;
