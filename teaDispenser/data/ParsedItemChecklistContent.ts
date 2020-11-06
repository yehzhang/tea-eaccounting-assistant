import { ItemChecklistEntry } from './itemChecklistEntry';
import { ParsedValue } from './parsedValue';
import { User } from './User';

export interface ParsedItemChecklistContent {
  readonly entries: readonly ParsedValue<ItemChecklistEntry>[];
  readonly participants: ParsedValue<readonly User[]> | null;
}
