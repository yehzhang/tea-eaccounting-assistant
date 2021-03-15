import getItemTypeIdByName from '../data/getItemTypeIdByName';
import normalizeItemName from '../data/normalizeItemName';
import RecognizedItem from '../data/RecognizedItem';
import UserInputPricedItemStack from '../data/UserInputPricedItemStack';
import fetchPriceByItemTypeId from './market/fetchPriceByItemTypeId';

async function populateItemStack({ name, amount, findIcon }: RecognizedItem): Promise<UserInputPricedItemStack> {
  const normalizationResult = await normalizeItemName(name, findIcon);
  if (normalizationResult.type !== 'ExactMatch') {
    return {
      name:
        normalizationResult.type === 'NormalizationOnly'
          ? normalizationResult.normalizedText
          : name,
      amount,
      price: null,
    };
  }

  const itemTypeId = getItemTypeIdByName(normalizationResult.text);
  const itemPrice = itemTypeId !== null && (await fetchPriceByItemTypeId(itemTypeId));
  return {
    name: normalizationResult.text,
    amount,
    price: itemPrice ? itemPrice.lowestSell : null,
  };
}

export default populateItemStack;
