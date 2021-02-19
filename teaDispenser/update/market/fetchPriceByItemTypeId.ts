import ItemPrice from '../../data/ItemPrice';
import fetchMarketSnapshot from './fetchMarketSnapshot';
import MarketSnapshot from './MarketSnapshot';

async function fetchPriceByItemTypeId(itemTypeId: number): Promise<ItemPrice | null> {
  const marketSnapshot = await fetchMarketSnapshotMemo();
  return marketSnapshot[itemTypeId.toString()] || null;
}

async function fetchMarketSnapshotMemo(): Promise<MarketSnapshot> {
  if (!marketSnapshotState) {
    const fetchedAt = new Date();
    marketSnapshotState = fetchMarketSnapshot().then((marketSnapshot) => {
      marketSnapshotState = {
        marketSnapshot,
        fetchedAt,
      };
      return marketSnapshotState;
    });
  }
  if (marketSnapshotState instanceof Promise) {
    const { marketSnapshot } = await marketSnapshotState;
    return marketSnapshot;
  }

  const { marketSnapshot, fetchedAt } = marketSnapshotState;
  // Reset the cache every half an hour.
  if (1800000 < Date.now() - fetchedAt.getTime()) {
    marketSnapshotState = null;
    return fetchMarketSnapshotMemo();
  }

  return marketSnapshot;
}

let marketSnapshotState: MarketSnapshotState | Promise<MarketSnapshotState> | null = null;

interface MarketSnapshotState {
  readonly marketSnapshot: MarketSnapshot;
  readonly fetchedAt: Date;
}

export default fetchPriceByItemTypeId;
