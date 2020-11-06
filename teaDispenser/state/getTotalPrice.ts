import * as _ from 'lodash';
import { ItemChecklistEntry } from '../data/itemChecklistEntry';

export function getTotalPrice(entries: readonly ItemChecklistEntry[]): number {
  return _.sum(entries.map(({ amount, price }) => price * amount));
}
