import * as _ from 'lodash';
import ItemRow from '../data/ItemRow';
import ItemSplit from '../data/ItemSplit';
import ParticipantColumn from '../data/ParticipantColumn';
import splitItemsAmongParticipants from './splitItemsAmongParticipants';

function settleUpParticipants({
  participants,
  spareItems,
}: ItemSplit): readonly ParticipantColumn[] {
  const participantsItems = participants.map(({ items }) => items.flatMap(splitItemStack));
  const splitSpareItems = spareItems.flatMap(splitItemStack);
  const settledUpParticipantsItems = splitItemsAmongParticipants(
    participantsItems,
    splitSpareItems,
    ({ price }) => price
  );
  return _.zipWith(participants, settledUpParticipantsItems, (participant, items) => ({
    ...participant,
    // Stack all items.
    items: Object.values(_.groupBy(items, ({ rowIndex }) => rowIndex)).map((items) => ({
      rowIndex: items[0].rowIndex,
      price: items[0].price,
      amount: items.length,
    })),
  }));
}

function splitItemStack({ amount, rowIndex, price }: ItemRow): readonly ItemRow[] {
  return Array(amount)
    .fill(null)
    .map(() => ({
      rowIndex,
      price,
      amount: 1,
    }));
}

export default settleUpParticipants;
