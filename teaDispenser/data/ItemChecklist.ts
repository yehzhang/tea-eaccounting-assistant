import { ItemChecklistEntry } from './itemChecklistEntry';
import { User } from './User';

export interface ItemChecklist {
  readonly entries: readonly ItemChecklistEntry[];
  readonly author: User;
  readonly createdAt: Date;
  readonly participants: readonly User[];
}
