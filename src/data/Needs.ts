import ItemStack from './ItemStack';

type Needs = readonly Need[];

interface Need {
  readonly needer: string;
  readonly item: ItemStack;
}

export default Needs;
