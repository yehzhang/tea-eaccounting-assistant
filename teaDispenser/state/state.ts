import { ItemChecklist } from '../data/ItemChecklist';
import { ItemChecklistEntry } from '../data/itemChecklistEntry';
import { ParsedItemChecklistContent } from '../data/ParsedItemChecklistContent';
import { ParsedValue } from '../data/parsedValue';
import { User } from '../data/User';

export type State =
    | Pong
    | DetectedItems
    | ItemChecklistSubmittedConfirmation
    | FetchedItemChecklistsOfToday
    | SettledUpParticipants
    | ChecklistNotSelected
    | LedgerEntry
    ;

interface Pong {
  readonly type: 'Pong',
}

interface DetectedItems {
  readonly type: 'DetectedItems',
  readonly items: readonly DetectedItem[];
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
