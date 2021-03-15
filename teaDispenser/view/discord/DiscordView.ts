import FleetLoot from '../../data/FleetLoot';
import FleetMemberLoot from '../../data/FleetMemberLoot';
import InvalidCommand from '../../data/InvalidCommand';
import ItemPrice from '../../data/ItemPrice';
import Needs from '../../data/Needs';
import UserInputPricedItemStack from '../../data/UserInputPricedItemStack';

type DiscordView =
  | {
      readonly type: 'Pong';
    }
  | {
      readonly type: 'DetectingItems';
      readonly magnifierDirection: boolean;
    }
  | {
      readonly type: 'NoItemsDetected';
    }
  | {
      readonly type: 'ItemsRecognized';
      readonly itemStacks: readonly UserInputPricedItemStack[];
      readonly username: string;
      readonly fleetLootEditorUrl: string;
      readonly neederChooserUrl: string;
    }
  | {
      readonly type: 'FleetLootRecordUpdated';
      readonly fleetLoot: FleetLoot;
      readonly needs: Needs;
      readonly title: string;
      readonly fleetLootEditorUrl: string;
      readonly neederChooserUrl: string;
    }
  | {
      readonly type: 'NoParticipantsToSettleUp';
    }
  | {
      readonly type: 'AllItemsFilledInNeeded';
    }
  | {
      readonly type: 'ParticipantsSettledUp';
      readonly fleetMembersLoot: readonly FleetMemberLoot[];
      readonly fleetLootRecordTitle: string;
    }
  | InvalidCommand
  | {
      readonly type: 'LookingUpHistoryPrice';
    }
  | {
      readonly type: 'MultipleMarketQueryResult';
      readonly results: readonly MarketQueryResult[];
    }
  | {
      readonly type: 'Deleted';
    }
  | {
      readonly type: 'InternalError';
    };

export interface SingleMarketQueryResult {
  readonly type: 'SingleMarketQueryResult';
  readonly itemName: string;
  readonly itemPrice: ItemPrice;
}

interface UnknownItemName {
  readonly type: 'UnknownItemName';
  readonly itemName: string;
}

interface MarketPriceNotAvailable {
  readonly type: 'MarketPriceNotAvailable';
  readonly itemName: string;
  readonly itemTypeId: number;
}

export type MarketQueryResult = SingleMarketQueryResult | UnknownItemName | MarketPriceNotAvailable;

export default DiscordView;
