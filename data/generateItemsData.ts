import readNeoxJson from './readNeoxJson';
import { writeText } from './writeText';

function main() {
  const [, , itemsDataDirectory, outputDirectory] = process.argv;
  const items = readNeoxJson(itemsDataDirectory);
  const duplicateItems = new Set<string>();
  const itemsData = Object.entries(items).reduce<{ [itemName: string]: number }>(
    (acc, [itemTypeIdString, itemData]) => {
      const itemTypeId = Number(itemTypeIdString);
      if (isNaN(itemTypeId)) {
        console.warn('Expected valid itemTypeId', itemTypeIdString, itemData);
        return acc;
      }

      const itemName = itemData.zh_name;
      if (itemName in acc) {
        duplicateItems.add(itemName);
      }

      acc[itemName] = itemTypeId;

      return acc;
    },
    {}
  );

  for (const itemName of duplicateItems) {
    delete itemsData[itemName];
  }
  console.log('Removed', duplicateItems.size, 'duplicate items');

  const itemsDataString = JSON.stringify(itemsData, null, 2);
  writeText(itemsDataString, outputDirectory, 'items.json');
}

main();
