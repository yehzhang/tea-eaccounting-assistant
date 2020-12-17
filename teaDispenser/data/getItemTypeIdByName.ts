import items from '../../generated/items.json';
import { translateToChinese } from './translateToChinese';

function getItemTypeIdByName(itemName: string): number | null {
  const zhItemName = translateToChinese(itemName);
  return (items as { [itemName: string]: number })[zhItemName] || null;
}

export default getItemTypeIdByName;
