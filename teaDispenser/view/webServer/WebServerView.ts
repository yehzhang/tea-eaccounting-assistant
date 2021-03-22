import FleetLoot from '../../data/FleetLoot';
import ItemStack from '../../data/ItemStack';
import NeedsEditorLink from '../../data/NeedsEditorLink';

type WebServerView =
  | {
      readonly type: 'Index';
    }
  | {
      readonly type: 'FleetLootEditor';
      readonly fleetLoot: FleetLoot;
    }
  | {
      readonly type: 'FleetLootEditorInvalidInput';
    }
  | {
      readonly type: 'InvalidFleetLootRecord';
    }
  | {
      readonly type: 'UpdatedConfirmation';
    }
  | {
      readonly type: 'NeederChooser';
      readonly needsEditorLinks: readonly NeedsEditorLink[];
    }
  | {
      readonly type: 'PendingFleetLootRecord';
    }
  | {
      readonly type: 'NeedsEditor';
      readonly itemStacks: readonly ItemStack[];
    };

export default WebServerView;
