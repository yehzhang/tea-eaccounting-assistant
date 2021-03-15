import FleetLoot from './FleetLoot';
import Needs from './Needs';

interface FleetLootRecord {
  readonly createdAt: Date;
  readonly fleetLoot: FleetLoot;
  readonly needs: Needs;
  readonly title: string;
}

export default FleetLootRecord;
