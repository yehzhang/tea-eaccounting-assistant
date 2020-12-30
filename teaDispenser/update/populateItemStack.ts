import ItemStack from '../data/ItemStack';
import normalizeItemName from '../data/normalizeItemName';
import RecognizedItem from '../data/RecognizedItem';
import getJitaPrice from './market/getJitaPrice';
import queryMarketPriceByName from './queryMarketPriceByName';

async function populateItemStack({ name, amount, findIcon }: RecognizedItem): Promise<ItemStack> {
  const normalizationResult = await normalizeItemName(name, findIcon);
  const exactName = normalizationResult.type === 'ExactMatch' ? normalizationResult.text : null;
  const query = exactName && (await queryMarketPriceByName(exactName));
  return {
    name: exactName
      ? exactName
      : normalizationResult.type === 'NormalizationOnly'
      ? normalizationResult.normalizedText
      : name,
    amount,
    price: query ? getJitaPrice(query.orders) : null,
  };
}

export default populateItemStack;
