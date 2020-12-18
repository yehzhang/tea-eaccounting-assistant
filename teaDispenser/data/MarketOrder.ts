interface MarketOrder {
  readonly price: number;
  readonly remainingVolume: number;
  readonly stationId: number;
  readonly solarSystemName: string;
  readonly sell: boolean;
}

export default MarketOrder;
