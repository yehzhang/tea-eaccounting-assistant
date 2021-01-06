import ItemStack from '../data/ItemStack';
import normalizeItemName from '../data/normalizeItemName';
import RecognizedItem from '../data/RecognizedItem';
import fetchMarketOrdersByName from './fetchMarketOrdersByName';
import getJitaItcPrice from './market/getJitaItcPrice';

async function populateItemStack({ name, amount, findIcon }: RecognizedItem): Promise<ItemStack> {
  const normalizationResult = await normalizeItemName(name, findIcon);
  const exactName = normalizationResult.type === 'ExactMatch' ? normalizationResult.text : null;
  const query = exactName && (await fetchMarketOrdersByName(exactName));
  return {
    name: exactName
      ? exactName
      : normalizationResult.type === 'NormalizationOnly'
        ? normalizationResult.normalizedText
        : name,
    amount,
    price: query ? getJitaItcPrice(query.orders.filter(({ sell }) => sell), /* max= */ false) : null,
  };
}

export default populateItemStack;
