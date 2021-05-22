import cv, { Mat } from 'opencv4nodejs';
import ItemIcon from '../../../data/ItemIcon';
import ItemType from '../../../data/ItemType';
import getPathRelativeToFileDirname from './getPathRelativeToFileDirname';
import matchBestTemplate from './matchBestTemplate';
import resizeHeightTo from './resizeHeightTo';

async function recognizeItemIcon(
  itemStackImage: Mat,
  itemType: ItemType
): Promise<ItemIcon | null> {
  const normalizedImage = await normalizeImage(itemStackImage);

  const blueprintsIconTemplates = await blueprintsIconTemplatesPromise;
  const matchedTemplateIndex = await matchBestTemplate(
    normalizedImage,
    blueprintsIconTemplates[itemType].map((template, index) => [index, template] as const),
    minTemplateMatchingConfidence
  );
  if (matchedTemplateIndex === null) {
    return null;
  }
  return {
    type: 'BlueprintIcon',
    techLevel: (matchedTemplateIndex + 1) as 1 | 2 | 3 | 4,
  };
}

const minTemplateMatchingConfidence = 0.2;

async function normalizeImage(image: Mat): Promise<Mat> {
  // An item stack of height 275 has roughly a rig icon of height 116, which is the height of the template.
  return resizeHeightTo(276, image);
}

const blueprintsIconTemplatesPromise: Promise<BlueprintsIconTemplates> = (async () => {
  const [
    laserRigBlueprintTemplates,
    armorRigBlueprintTemplates,
    engineeringRigBlueprintTemplates,
    scanRigBlueprintTemplates,
    miningRigBlueprintTemplates,
    droneRigBlueprintTemplates,
    railgunRigBlueprintTemplates,
    decomposerRigBlueprintTemplates,
    navigationRigBlueprintTemplates,
  ] = await Promise.all([
    Promise.all([
      getTemplate('11702000000.png'),
      getTemplate('11702000001.png'),
      getTemplate('11702000002.png'),
      getTemplate('11702000003.png'),
    ]),
    Promise.all([
      getTemplate('11708000000.png'),
      getTemplate('11708000001.png'),
      getTemplate('11708000002.png'),
      getTemplate('11708000003.png'),
    ]),
    Promise.all([
      getTemplate('11711000000.png'),
      getTemplate('11711000001.png'),
      getTemplate('11711000002.png'),
      getTemplate('11711000003.png'),
    ]),
    Promise.all([
      getTemplate('11714000000.png'),
      getTemplate('11714000001.png'),
      getTemplate('11714000002.png'),
      getTemplate('11714000003.png'),
    ]),
    Promise.all([
      getTemplate('11717000000.png'),
      getTemplate('11717000001.png'),
      getTemplate('11717000002.png'),
      getTemplate('11717000003.png'),
    ]),
    Promise.all([
      getTemplate('11719000000.png'),
      getTemplate('11719000001.png'),
      getTemplate('11719000002.png'),
      getTemplate('11719000003.png'),
    ]),
    Promise.all([
      getTemplate('11700000000.png'),
      getTemplate('11700000001.png'),
      getTemplate('11700000002.png'),
      getTemplate('11700000003.png'),
    ]),
    Promise.all([
      getTemplate('11005050002.png'),
      getTemplate('11005050004.png'),
      getTemplate('11005050006.png'),
      getTemplate('11005050008.png'),
    ]),
    Promise.all([
      getTemplate('11710000000.png'),
      getTemplate('11710000001.png'),
      getTemplate('11710000002.png'),
      getTemplate('11710000003.png'),
    ]),
  ]);
  return {
    LaserRigBlueprint: laserRigBlueprintTemplates,
    DroneRigBlueprint: droneRigBlueprintTemplates,
    ArmorRigBlueprint: armorRigBlueprintTemplates,
    EngineeringRigBlueprint: engineeringRigBlueprintTemplates,
    ScanRigBlueprint: scanRigBlueprintTemplates,
    MiningRigBlueprint: miningRigBlueprintTemplates,
    RailgunRigBlueprint: railgunRigBlueprintTemplates,
    DecomposerRigBlueprint: decomposerRigBlueprintTemplates,
    NavigationRigBlueprint: navigationRigBlueprintTemplates,
  };
})();

async function getTemplate(filename: string): Promise<Mat> {
  const templatePath = getPathRelativeToFileDirname(import.meta.url, 'template/itemIcon', filename);
  return cv.imreadAsync(templatePath);
}

type BlueprintsIconTemplates = { readonly [itemType in ItemType]: readonly [Mat, Mat, Mat, Mat] };

export default recognizeItemIcon;
