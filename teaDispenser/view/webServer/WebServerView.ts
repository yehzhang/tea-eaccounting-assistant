import FleetLoot from '../../data/FleetLoot';
import ItemStack from '../../data/ItemStack';
import NeedsEditorLink from '../../data/NeedsEditorLink';

type WebServerView =
  | {
      readonly type: 'IndexView';
    }
  | {
      readonly type: 'FleetLootEditorView';
      readonly fleetLoot: FleetLoot;
    }
  | {
      readonly type: 'InvalidFleetLootEditorInputView';
    }
  | {
      readonly type: 'InvalidFleetLootRecordView';
    }
  | {
      readonly type: 'UpdatedConfirmationView';
    }
  | {
      readonly type: 'NeederChooserView';
      readonly needsEditorLinks: readonly NeedsEditorLink[];
    }
  | {
      readonly type: 'PendingFleetLootRecordView';
    }
  | {
      readonly type: 'NeedsEditorView';
      readonly itemStacks: readonly ItemStack[];
    };

export default WebServerView;
