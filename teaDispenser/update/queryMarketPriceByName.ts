import getItemTypeIdByName from '../data/getItemTypeIdByName';
import MarketQuery from '../data/MarketQuery';
import queryMarketBuyOrders from './market/queryMarketBuyOrders';

async function queryMarketPriceByName(itemName: string): Promise<MarketQuery | null> {
  const itemTypeId = getItemTypeIdByName(itemName);
  if (itemTypeId === null) {
    return null;
  }
  return queryMarketBuyOrders(itemTypeId);
}

export default queryMarketPriceByName;
