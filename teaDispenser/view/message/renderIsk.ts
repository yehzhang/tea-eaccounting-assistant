import renderNumber from './renderNumber';

function renderIsk(price: number): string {
  return `__Ƶ ${renderNumber(price)}__`;
}

export default renderIsk;
