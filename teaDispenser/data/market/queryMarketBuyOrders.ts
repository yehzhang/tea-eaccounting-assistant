import fetch from 'node-fetch';
import MarketQuery from './MarketQuery';

async function queryMarketBuyOrders(itemTypeId: number): Promise<MarketQuery | null> {
  const response = await fetch(`http://138.68.255.93:8000/${itemTypeId}`);
  const result = await response.json();
  if (typeof result !== 'object' || result === null || 'error' in result) {
    console.error('Unexpected error in database fetch', result);
    return null;
  }

  const fetchedAtString = (result as any).fetched_at;
  const fetchedAt = new Date(fetchedAtString);
  if (isNaN(fetchedAt.getTime())) {
    console.error('Expected valid `fetched_at` from database, got', fetchedAtString);
    return null;
  }

  return {
    orders: (result as any).orders
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
