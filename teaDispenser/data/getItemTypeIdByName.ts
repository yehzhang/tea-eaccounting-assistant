import items from './items.json';
import { normalizeItemName } from './normalizeItemName';
import { translateToChinese } from './translateToChinese';

function getItemTypeIdByName(itemName: string): number | null {
  const normalizedItemName = normalizeItemName(itemName);
  if (normalizedItemName.type !== 'ExactMatch') {
    return null;
  }

  const zhItemName = translateToChinese(normalizedItemName.text);
  return (items as { [itemName: string]: number })[zhItemName] || null;
}

export default getItemTypeIdByName;
