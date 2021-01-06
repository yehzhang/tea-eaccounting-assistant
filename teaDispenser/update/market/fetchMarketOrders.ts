import axios from 'axios';
import MarketOrder from '../../data/MarketOrder';
import MarketQuery from '../../data/MarketQuery';

async function fetchMarketOrders(itemTypeId: number): Promise<MarketQuery | null> {
  const response = await axios({
    url: `http://138.68.255.93:8000/${itemTypeId}`,
  });
  const { data } = response;
  if (typeof data !== 'object' || data === null) {
    console.error('Expected valid response in database fetch', data);
    return null;
  }
  if ('error' in data) {
    if (data.error !== 'Unknown item_type_id') {
      console.error('Unexpected error in database fetch', data);
    }
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
      .map((order: any): MarketOrder | null => {
        const {
          price,
          remaining_volume: remainingVolume,
          solar_system_name: solarSystemName,
          station_id: stationId,
          bid,
        } = order || {};
        if (
          typeof price !== 'number' ||
          typeof remainingVolume !== 'number' ||
          typeof solarSystemName !== 'string' ||
          typeof stationId !== 'number' ||
          typeof bid !== 'number'
        ) {
          console.error('Expected valid order, got', order);
          return null;
        }
        return {
          price,
          remainingVolume,
          solarSystemName,
          stationId,
          sell: !bid,
        };
      }),
    fetchedAt,
  };
}

export default fetchMarketOrders;
