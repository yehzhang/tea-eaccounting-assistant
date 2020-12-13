import axios from 'axios';
import MarketQuery from './MarketQuery';

async function queryMarketBuyOrders(itemTypeId: number): Promise<MarketQuery | null> {
  const response = await axios({
    url: `http://138.68.255.93:8000/${itemTypeId}`,
  });
  const { data } = response;
  if (typeof data !== 'object' || data === null || 'error' in data) {
    console.error('Unexpected error in database fetch', data);
    return null;
  }

  const fetchedAtString = (data as any).fetched_at;
  const fetchedAt = new Date(fetchedAtString);
  if (isNaN(fetchedAt.getTime())) {
    console.error('Expected valid `fetched_at` from database, got', fetchedAtString);
    return null;
  }

  return {
    orders: (data as any).orders
        .map((order: any) => {
          const {
            price,
            remaining_volume: remainingVolume,
            solar_system_name: solarSystemName,
            bid,
          } = order || {};
          if (typeof price !== 'number' || typeof remainingVolume !== 'number' || typeof solarSystemName !== 'string') {
            console.error('Expected valid order, got', order);
            return null;
          }
          return {
            price,
            remainingVolume,
            solarSystemName,
            sell: !bid,
          };
        })
        .filter((order: any) => order?.sell),
    fetchedAt,
  };
}

export default queryMarketBuyOrders;
