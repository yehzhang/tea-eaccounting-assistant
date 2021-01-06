import getItemTypeIdByName from '../data/getItemTypeIdByName';
import MarketQuery from '../data/MarketQuery';
import fetchMarketOrders from './market/fetchMarketOrders';

async function fetchMarketOrdersByName(itemName: string): Promise<MarketQuery | null> {
  const itemTypeId = getItemTypeIdByName(itemName);
  if (itemTypeId === null) {
    return null;
  }
  return fetchMarketOrders(itemTypeId);
}

export default fetchMarketOrdersByName;
