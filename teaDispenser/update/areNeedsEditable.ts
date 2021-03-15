import FleetLoot from '../data/FleetLoot';

function areNeedsEditable({ loot, fleetMembers }: FleetLoot) {
  return loot.length && loot.every(({ name }) => name) && fleetMembers.length;
}

export default areNeedsEditable;
