import getItemTypeIdByName from '../data/getItemTypeIdByName';
import ItemStack from '../data/ItemStack';
import normalizeItemName from '../data/normalizeItemName';
import RecognizedItem from '../data/RecognizedItem';
import fetchPriceByItemTypeId from './market/fetchPriceByItemTypeId';

async function populateItemStack({ name, amount, findIcon }: RecognizedItem): Promise<ItemStack> {
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
