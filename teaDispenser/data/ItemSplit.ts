import ItemRow from './ItemRow';
import ParticipantColumn from './ParticipantColumn';

interface ItemSplit {
  readonly participants: readonly ParticipantColumn[];
  readonly spareItems: readonly ItemRow[];
}

export default ItemSplit;
