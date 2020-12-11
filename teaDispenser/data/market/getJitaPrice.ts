import MarketOrder from './MarketOrder';

function getJitaPrice(orders: readonly MarketOrder[]): number | null {
  const jitaOrders = orders.filter(({ stationId }) => stationId === jitaItcStationId);
  if (!jitaOrders.length) {
    return null;
  }
  return Math.min(...jitaOrders.map(({ price }) => price));
}

const jitaItcStationId = 60003760;

export default getJitaPrice;
