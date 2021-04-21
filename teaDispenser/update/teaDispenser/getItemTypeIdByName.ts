import items from '../../../generated/items.json';
import texts from '../../../generated/textPacks.json';

function getItemTypeIdByName(itemName: string): number | null {
  const zhItemName = translateToChinese(itemName);
  return (items as { [itemName: string]: number })[zhItemName] || null;
}

function translateToChinese(text: string): string {
  const textPack = texts.find(({ en }) => en === text);
  return textPack ? textPack.zh : text;
}

export default getItemTypeIdByName;
