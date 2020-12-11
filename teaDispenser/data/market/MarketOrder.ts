interface MarketOrder {
  readonly price: number;
  readonly remainingVolume: number;
  readonly stationId: number;
  readonly solarSystemId: number;
}

export default MarketOrder;
