import InvalidCommand from '../data/InvalidCommand';
import { ItemChecklist } from '../data/ItemChecklist';
import { ItemChecklistEntry } from '../data/itemChecklistEntry';
import MarketQuery from '../data/MarketQuery';
import { ParsedItemChecklistContent } from '../data/ParsedItemChecklistContent';
import { ParsedValue } from '../data/parsedValue';
import { User } from '../data/User';

export type State =
    | Pong
    | DetectedItems
    | NoItemsDetected
    | SpreadsheetCreationFailure
    | SpreadsheetCreated
    | ItemChecklistSubmittedConfirmation
    | FetchedItemChecklistsOfToday
    | SettledUpParticipants
    | ChecklistNotSelected
    | LedgerEntry
    | InvalidCommand
    | SingleMarketQueryResult
    | UnknownItemName
    | MarketPriceNotAvailable
    | MultipleMarketQueryResult
    ;

interface Pong {
  readonly type: 'Pong',
}

interface DetectedItems {
  readonly type: 'DetectedItems',
  readonly items: readonly DetectedItem[];
}

interface NoItemsDetected {
  readonly type: 'NoItemsDetected',
}

interface SpreadsheetCreationFailure {
  readonly type: 'SpreadsheetCreationFailure',
}

interface SpreadsheetCreated {
  readonly type: 'SpreadsheetCreated',
  readonly url: string;
}

interface DetectedItem {
  readonly name: ParsedValue<string>;
  readonly amount: ParsedValue<number>;
}

interface ItemChecklistSubmittedConfirmation {
  readonly type: 'ItemChecklistSubmittedConfirmation';
  readonly parsedItemChecklistContent: ParsedItemChecklistContent;
}

interface FetchedItemChecklistsOfToday {
  readonly type: 'FetchedItemChecklistsOfToday';
  // The most recent ones first.
  readonly checklists: readonly ItemChecklist[];
  readonly itemsPrices: ItemsPrices;
}

export interface ItemsPrices {
  readonly [itemName: string]: readonly number[];
}

interface SettledUpParticipants {
  readonly type: 'SettledUpParticipants';
  readonly checklistIndices: readonly number[];
  readonly itemTransitions: readonly ItemTransition[];
  readonly participants: readonly User[];
}

export interface ItemTransition {
  readonly sourceParticipantIndex: number;
  readonly targetParticipantIndex: number;
  readonly entry: ItemChecklistEntry;
}

interface ChecklistNotSelected {
  readonly type: 'ChecklistNotSelected';
}

interface LedgerEntry {
  readonly type: 'LedgerEntry';
  readonly checklistIndices: readonly number[];
  readonly itemsGrandTotal: number;
  readonly participants: readonly User[];
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
