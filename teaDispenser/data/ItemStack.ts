import Item from './Item';

interface ItemStack extends Item {
  readonly amount: number;
}

export default ItemStack;
