import Item from './Item';

interface UserInputPricedItemStack extends Item {
  readonly amount: number | null;
  readonly price: number | null;
}

export default UserInputPricedItemStack;
