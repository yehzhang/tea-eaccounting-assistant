import axios from 'axios';
import _ from 'lodash';
import logError from '../../../external/logError';
import MarketSnapshot from './MarketSnapshot';

async function fetchMarketSnapshot(): Promise<MarketSnapshot> {
  const { data } = await axios({
    url: `https://api.eve-echoes-market.com/market-stats/stats.csv`,
  });
  if (typeof data !== 'string') {
    logError('Expected valid response in database fetch', data);
    return {};
  }

  return Object.assign({}, ..._.compact(data.split('\n').slice(1)).map(parseMarketSnapshotRow));
}

function parseMarketSnapshotRow(row: string): MarketSnapshot {
  const columns = row.split(',');
  if (columns.length !== 7) {
    logError('Received invalid number of columns in a market snapshot row', row);
    return {};
  }

  const [
    itemTypeId,
    ,
    dateColumn,
    estimatedSellColumn,
    estimatedBuyColumn,
    lowestSellColumn,
    highestBuyColumn,
  ] = columns;
  const estimatedSell = parseOptionalNumericColumn(estimatedSellColumn);
  const estimatedBuy = parseOptionalNumericColumn(estimatedBuyColumn);
  const lowestSell = parseOptionalNumericColumn(lowestSellColumn);
  const highestBuy = parseOptionalNumericColumn(highestBuyColumn);
  const date = parseOptionalDateColumn(dateColumn);
  if ((estimatedSell ?? estimatedBuy ?? lowestSell ?? highestBuy ?? date) === null) {
    logError('Received invalid market snapshot row', row);
    return {};
  }
  return {
    [itemTypeId]: {
      estimatedSell,
      estimatedBuy,
      lowestSell,
      highestBuy,
      date,
    },
  };
}

function parseOptionalNumericColumn(column: string): number | null {
  if (!column) {
    return null;
  }

  const value = Number(column);
  if (isNaN(value)) {
    logError('Received invalid numeric column in market snapshot', column);
    return null;
  }

  return value;
}

function parseOptionalDateColumn(column: string): Date | null {
  if (!column) {
    return null;
  }

  const value = new Date(column);
  if (isNaN(value.getTime())) {
    logError('Received invalid date column in market snapshot', column);
    return null;
  }

  return value;
}

export default fetchMarketSnapshot;
