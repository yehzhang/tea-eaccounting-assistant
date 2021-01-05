import _ from 'lodash';

function renderPrice(price: number): string {
  const normalizedPrice = price < 100 ? _.round(price, 1) : Math.ceil(price);
  return normalizedPrice.toLocaleString('en');
}

export default renderPrice;
