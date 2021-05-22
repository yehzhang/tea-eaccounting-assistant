import ItemPrice from '../../../data/ItemPrice';

interface MarketSnapshot {
  readonly [itemTypeId: string]: ItemPrice;
}

export default MarketSnapshot;
