import _ from 'lodash';

function renderPrice(price: number | null): string {
  if (price === null) {
    return '';
  }

  const normalizedPrice = price < 100 ? _.round(price, 1) : Math.ceil(price);
  return normalizedPrice.toLocaleString('en');
}

export default renderPrice;
