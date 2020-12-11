import MarketOrder from './MarketOrder';

interface MarketQuery {
  readonly orders: MarketOrder[];
  readonly fetchedAt: Date;
}

export default MarketQuery;
