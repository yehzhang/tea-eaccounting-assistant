import _ from 'lodash';

function renderNumber(number: number | null): string {
  if (number === null) {
    return '';
  }

  const normalizedPrice = number < 100 ? _.round(number, 1) : Math.ceil(number);
  return normalizedPrice.toLocaleString('en');
}

export default renderNumber;
