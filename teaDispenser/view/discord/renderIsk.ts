import renderNumber from './renderNumber';

function renderIsk(price: number | null): string {
  return `__Ƶ ${renderNumber(price)}__`;
}

export default renderIsk;
