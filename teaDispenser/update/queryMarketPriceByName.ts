import getItemTypeIdByName from '../data/getItemTypeIdByName';
import queryMarketBuyOrders from '../data/market/queryMarketBuyOrders';
import { MarketPriceNotAvailable, SingleMarketQueryResult, UnknownItemName } from '../state/state';

async function queryMarketPriceByName(itemName: string): Promise<SingleMarketQueryResult | UnknownItemName | MarketPriceNotAvailable> {
  const itemTypeId = getItemTypeIdByName(itemName);
  if (itemTypeId === null) {
    return {
      type: 'UnknownItemName',
      itemName,
    }
  }

  const query = await queryMarketBuyOrders(itemTypeId);
  if (!query || !query.orders.length) {
    return {
      type: 'MarketPriceNotAvailable',
      itemName,
    };
  }

  return {
    type: 'SingleMarketQueryResult',
    itemName,
    query,
  };
}

export default queryMarketPriceByName;
