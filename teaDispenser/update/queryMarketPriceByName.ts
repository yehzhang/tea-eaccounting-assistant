import getItemTypeIdByName from '../data/getItemTypeIdByName';
import queryMarketOrders from '../data/market/queryMarketOrders';
import { MarketPriceNotAvailable, SingleMarketQueryResult, UnknownItemName } from '../state/state';

async function queryMarketPriceByName(itemName: string): Promise<SingleMarketQueryResult | UnknownItemName | MarketPriceNotAvailable> {
  const itemTypeId = getItemTypeIdByName(itemName);
  if (itemTypeId === null) {
    return {
      type: 'UnknownItemName',
      itemName,
    }
  }

  const query = await queryMarketOrders(itemTypeId);
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
