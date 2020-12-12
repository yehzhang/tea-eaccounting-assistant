import { resolve } from 'path';
import sqlite, { open } from 'sqlite'
import sqlite3 from 'sqlite3';
import MarketQuery from './MarketQuery';

async function queryMarketOrders(itemTypeId: number): Promise<MarketQuery | null> {
  const database = await getDatabase();
  const fetchedAtRow = await database.get(`
      select fetched_at
      from market_order
      where item_type_id = :item_type_id
      order by fetched_at desc
      limit 1
  `, {
    ':item_type_id': itemTypeId,
  });
  if (!fetchedAtRow) {
    return null;
  }

  const fetchedAt = new Date(fetchedAtRow.fetched_at);
  if (isNaN(fetchedAt.getTime())) {
    console.warn('Expected valid `fetched_at` from database, got', fetchedAtRow);
    return null;
  }

  const orderRows = await database.all(`
      select price
           , remaining_volume
           , station_id
           , solar_system_id
      from market_order
      where item_type_id = :item_type_id
        and fetched_at = :fetched_at
  `, {
    ':item_type_id': itemTypeId,
    ':fetched_at': fetchedAtRow.fetched_at,
  });

  return {
    orders: orderRows.map(
        ({ price, remaining_volume: remainingVolume, station_id: stationId, solar_system_id: solarSystemId }) => ({
          price, remainingVolume, stationId, solarSystemId,
        })),
    fetchedAt,
  };
}

// const jitaSolarSystemId = 30000142;

let databasePromise: Promise<sqlite.Database>;

function getDatabase(): Promise<sqlite.Database> {
  if (!databasePromise) {
    databasePromise = open({
      filename: resolve(__dirname, '../../../priceFetcher/eve_echoes.db'),
      driver: sqlite3.Database,
      mode: sqlite3.OPEN_READONLY,
    });
  }
  return databasePromise;
}

export default queryMarketOrders;
