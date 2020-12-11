function renderPrice(price: number): string {
  return Math.ceil(price).toLocaleString('en');
}

export default renderPrice;
