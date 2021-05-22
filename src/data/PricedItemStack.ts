import ItemStack from './ItemStack';

interface PricedItemStack extends ItemStack {
  readonly price: number;
}

export default PricedItemStack;
