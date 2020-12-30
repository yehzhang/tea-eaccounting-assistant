import InvalidCommand from './data/InvalidCommand';
import MarketQuery from './data/MarketQuery';

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
    | SingleMarketQueryResult
    | UnknownItemName
    | MarketPriceNotAvailable
    | MultipleMarketQueryResult
    ;

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

export interface ItemsPrices {
  readonly [itemName: string]: readonly number[];
}

export interface SingleMarketQueryResult {
  readonly type: 'SingleMarketQueryResult';
  readonly itemName: string;
  readonly query: MarketQuery;
}

export interface UnknownItemName {
  readonly type: 'UnknownItemName';
  readonly itemName: string;
}

export interface MarketPriceNotAvailable {
  readonly type: 'MarketPriceNotAvailable';
  readonly itemName: string;
}

interface MultipleMarketQueryResult {
  readonly type: 'MultipleMarketQueryResult';
  readonly results: readonly MarketQueryResult[];
}

export type MarketQueryResult =
    | AggregatedMarketPrice
    | UnknownItemName
    | MarketPriceNotAvailable;

export interface AggregatedMarketPrice {
  readonly type: 'AggregatedMarketPrice';
  readonly itemName: string;
  readonly jitaPrice: number | null;
  readonly weightedAveragePrice: number;
  readonly fetchedAt: Date;
}

export default State;