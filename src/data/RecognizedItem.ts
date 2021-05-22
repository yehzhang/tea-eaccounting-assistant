import ItemIcon from './ItemIcon';
import ItemType from './ItemType';

interface RecognizedItem {
  readonly name: string;
  readonly amount: number | null;
  readonly findIcon: (itemType: ItemType) => Promise<ItemIcon | null>;
}

export default RecognizedItem;
