interface ItemPrice {
  readonly lowestSell: number | null;
  readonly estimatedSell: number | null;
  readonly highestBuy: number | null;
  readonly estimatedBuy: number | null;
  readonly date: Date | null;
}

export default ItemPrice;
