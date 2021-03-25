import FleetLoot from '../../data/FleetLoot';
import FleetMemberLoot from '../../data/FleetMemberLoot';
import InvalidCommand from '../../data/InvalidCommand';
import ItemPrice from '../../data/ItemPrice';
import Needs from '../../data/Needs';
import UserInputPricedItemStack from '../../data/UserInputPricedItemStack';

type MessageView =
  | {
      readonly type: 'PongView';
    }
  | {
      readonly type: 'DetectingItemsView';
      readonly magnifierDirection: boolean;
    }
  | {
      readonly type: 'NoItemsDetectedView';
    }
  | {
      readonly type: 'ItemsRecognizedView';
      readonly itemStacks: readonly UserInputPricedItemStack[];
      readonly username: string;
      readonly fleetLootEditorUrl: string;
      readonly neederChooserUrl: string;
    }
  | {
      readonly type: 'FleetLootRecordUpdatedView';
      readonly fleetLoot: FleetLoot;
      readonly needs: Needs;
      readonly title: string;
      readonly fleetLootEditorUrl: string;
      readonly neederChooserUrl: string;
    }
  | {
      readonly type: 'NoFleetMemberToSettleUpView';
    }
  | {
      readonly type: 'FleetMembersSettledUpView';
      readonly totalLootPrice: number;
      readonly averageLootPricePerMember: number;
      readonly fleetMembersLoot: readonly FleetMemberLoot[];
      readonly balanceClear: boolean;
      readonly fleetLootRecordTitle: string;
    }
  | InvalidCommand
  | {
      readonly type: 'MultipleMarketQueryResultView';
      readonly results: readonly MarketQueryResult[];
    }
  | {
      readonly type: 'DeletedView';
    }
  | {
      readonly type: 'InternalErrorView';
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

export default MessageView;
