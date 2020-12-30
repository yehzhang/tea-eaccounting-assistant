import _ from 'lodash';
import MarketOrder from '../../data/MarketOrder';

function getWeightedAverageMarketPrice(orders: readonly MarketOrder[]): number {
  const itcOrders = orders.filter(({ solarSystemName }) =>
    highSecItcSolarSystems.has(solarSystemName)
  );
  if (itcOrders.length) {
    return getWeightedAveragePrice(itcOrders);
  }
  return getWeightedAveragePrice(orders);
}

const highSecItcSolarSystems = new Set([
  '吉他',
  '阿里卡拉',
  '皮埃库拉',
  '欧拿蒙',
  '艾玛',
  '塔什蒙贡首星',
  '纳库加德',
  '卡多尔首星',
  '帕多尔',
  '阿伦特尼',
  '伦因',
  '奥威尔金',
  '尼拜恩界',
  '贝勒耶',
  '阿斯戈德',
  '奥斯汀格勒',
  '伊斯塔德',
  '玛斯帕',
  '卡美拉',
  '伊特林',
  '希伦尼',
]);

function getWeightedAveragePrice(orders: readonly MarketOrder[]): number {
  return (
    _.sumBy(orders, ({ price, remainingVolume }) => price * remainingVolume) /
    _.sumBy(orders, ({ remainingVolume }) => remainingVolume)
  );
}

export default getWeightedAverageMarketPrice;
