import MarketOrder from '../../data/MarketOrder';

function getJitaItcPrice(orders: readonly MarketOrder[], max: boolean): number | null {
  const jitaOrders = orders.filter(({ stationId }) => stationId === jitaItcStationId);
  if (!jitaOrders.length) {
    return null;
  }
  return (max ? Math.max : Math.min)(...jitaOrders.map(({ price }) => price));
}

const jitaItcStationId = 60003760;

export default getJitaItcPrice;
