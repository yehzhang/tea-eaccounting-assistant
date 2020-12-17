import Command from './data/Command';
import InvalidCommand from './data/InvalidCommand';
import { ItemChecklist } from './data/ItemChecklist';
import { ParsedItemChecklistContent } from './data/ParsedItemChecklistContent';

export type Event =
    | Pinged
    | ImagePosted
    | ItemChecklistPosted
    | SummaryButtonPressed
    | LedgerButtonPressed
    | HandsUpButtonPressed
    | CommandIssued
    ;

interface Pinged {
  readonly type: 'Pinged';
}

interface ImagePosted {
  readonly type: 'ImagePosted';
  readonly url: string;
  readonly userName: string;
}

interface ItemChecklistPosted {
  readonly type: 'ItemChecklistPosted';
  readonly parsedItemChecklistContent: ParsedItemChecklistContent;
}

interface SummaryButtonPressed {
  readonly type: 'SummaryButtonPressed';
  readonly fetchSubmittedItemChecklistsOfToday: () => Promise<readonly ItemChecklist[]>;
}

interface LedgerButtonPressed {
  readonly type: 'LedgerButtonPressed';
  readonly selectedChecklistIndices: readonly number[];
  readonly fetchSubmittedItemChecklistsOfToday: () => Promise<readonly ItemChecklist[]>;
}

interface HandsUpButtonPressed {
  readonly type: 'HandsUpButtonPressed';
  readonly selectedChecklistIndices: readonly number[];
  readonly fetchSubmittedItemChecklistsOfToday: () => Promise<readonly ItemChecklist[]>;
}

interface CommandIssued {
  readonly type: 'CommandIssued';
  readonly command: Command | InvalidCommand;
}
