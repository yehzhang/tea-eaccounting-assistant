import RecognizedItem from '../data/RecognizedItem';
import UserInputPricedItemStack from '../data/UserInputPricedItemStack';
import getItemTypeIdByName from './getItemTypeIdByName';
import fetchPriceByItemTypeId from './market/fetchPriceByItemTypeId';
import normalizeItemName from './normalizeItemName';

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
