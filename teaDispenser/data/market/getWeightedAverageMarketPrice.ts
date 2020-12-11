import _ from 'lodash';
import MarketOrder from './MarketOrder';

function getWeightedAverageMarketPrice(orders: readonly MarketOrder[]): number {
  return _.sumBy(orders, ({ price, remainingVolume }) => price * remainingVolume) /
      _.sumBy(orders, ({ remainingVolume }) => remainingVolume);
}

export default getWeightedAverageMarketPrice;
