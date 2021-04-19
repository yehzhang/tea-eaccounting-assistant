import * as _ from 'lodash';

function findRandomMinValuedItem<T>(
  items: readonly T[],
  valueGetter: (item: T) => number
): T | undefined {
  const minValue = Math.min(...items.map(valueGetter));
  return _.sample(items.filter((item) => valueGetter(item) === minValue));
}

export default findRandomMinValuedItem;
