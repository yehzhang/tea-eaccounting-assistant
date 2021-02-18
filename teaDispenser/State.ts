import InvalidCommand from './data/InvalidCommand';
import ItemPrice from './data/ItemPrice';

type State =
  | Pong
  | DetectingItems
  | NoItemsDetected
  | PopulatingSpreadsheet
  | SpreadsheetOperationFailure
  | SpreadsheetCreated
  | NoParticipantsToSettleUp
  | ParticipantsSettledUp
  | NoOpParticipantsSettledUp
  | InvalidCommand
  | LookingUpHistoryPrice
  | MultipleMarketQueryResult;

interface Pong {
  readonly type: 'Pong';
}

interface DetectingItems {
  readonly type: 'DetectingItems';
  readonly magnifierDirection: boolean;
}

interface NoItemsDetected {
  readonly type: 'NoItemsDetected';
}

interface PopulatingSpreadsheet {
  readonly type: 'PopulatingSpreadsheet';
}

interface SpreadsheetOperationFailure {
  readonly type: 'SpreadsheetOperationFailure';
}

interface SpreadsheetCreated {
  readonly type: 'SpreadsheetCreated';
  readonly url: string;
  readonly linkTitle: string;
}

interface NoParticipantsToSettleUp {
  readonly type: 'NoParticipantsToSettleUp';
}

interface ParticipantsSettledUp {
  readonly type: 'ParticipantsSettledUp';
  readonly gainedParticipants: readonly string[];
  readonly noOpParticipants: readonly string[];
}

interface NoOpParticipantsSettledUp {
  readonly type: 'NoOpParticipantsSettledUp';
}

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

interface LookingUpHistoryPrice {
  readonly type: 'LookingUpHistoryPrice';
}

interface MultipleMarketQueryResult {
  readonly type: 'MultipleMarketQueryResult';
  readonly results: readonly MarketQueryResult[];
}

export type MarketQueryResult = SingleMarketQueryResult | UnknownItemName | MarketPriceNotAvailable;

export default State;
