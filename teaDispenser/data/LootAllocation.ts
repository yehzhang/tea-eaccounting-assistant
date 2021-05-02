interface LootAllocation<T> {
  readonly fleetMemberName: string;
  readonly weight: number;
  readonly targetValue: number;
  readonly loot: T[];
}

export default LootAllocation;
