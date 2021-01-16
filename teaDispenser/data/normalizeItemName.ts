import * as _ from 'lodash';
import texts from '../../generated/textPacks.json';
import powerSet from '../update/powerSet';
import getSemanticIdentifier from './getSemanticIdentifier';
import ItemIcon from './ItemIcon';
import ItemType from './ItemType';
import { findTextsByPrefix, makeTrie } from './trie';

async function normalizeItemName(
  text: string,
  getItemIcon: (itemType: ItemType) => Promise<ItemIcon | null>
): Promise<NormalizationResult> {
  const ellipsisFreeText = trimEllipsis(text);
  // If the text contains ellipsis, the name must not be a full name. Otherwise, the name may or may
  // not be a full name, because the ellipsis may or may not be recognized.
  const ellipsis = text !== ellipsisFreeText;
  const cleanText = ellipsisFreeText
    .replace(/’/g, `'`)
    .replace(/ 一 /g, ' - ')
    // Below should be handle by `listSimilarLookingTexts`, but it is too hard.
    // Hopefully, their frequencies are scarce.
    .replace(/([宅茎])冈/g, '钢')
    .replace(/士兽/g, '增')
    .replace(/力[口D]/g, '加')
    .replace(/弓虽/g, '强')
    .replace(/木几/g, '机')
    .replace(/木反/g, '板')
    .replace(/\\\\/g, 'l')
    .replace(/[/′]」\\/g, '小')
    .replace(/乡佳/g, '维');
  const similarLookingTexts = listSimilarLookingTexts(cleanText);
  const matchedSimilarLookingTexts = [];
  const allItemNameCandidates = [];
  for (const similarLookingText of similarLookingTexts) {
    const itemNameCandidates = findItemNamesByPrefix(similarLookingText, !ellipsis);
    const itemNameFilter =
      itemNameCandidates.length <= 1
        ? // This is an optimization to skip filtering when unnecessary.
          null
        : await getItemNameFilter(getItemIcon, similarLookingText);
    let filteredItemNameCandidates;
    if (itemNameFilter) {
      filteredItemNameCandidates = itemNameCandidates.filter(
        (candidate) => candidate.search(itemNameFilter) !== -1
      );
    } else {
      if (!ellipsis) {
        const exactMatchCandidate = itemNameCandidates.find(
          (candidate) =>
            getSemanticIdentifier(candidate) === getSemanticIdentifier(similarLookingText)
        );
        if (exactMatchCandidate) {
          return {
            type: 'ExactMatch',
            text: exactMatchCandidate,
          };
        }
      }
      filteredItemNameCandidates = itemNameCandidates;
    }
    if (filteredItemNameCandidates.length === 1) {
      return {
        type: 'ExactMatch',
        text: filteredItemNameCandidates[0],
      };
    }

    if (!filteredItemNameCandidates.length) {
      continue;
    }
    matchedSimilarLookingTexts.push(similarLookingText);
    allItemNameCandidates.push(...itemNameCandidates);
  }

  if (matchedSimilarLookingTexts.length === 1) {
    const matchedText = matchedSimilarLookingTexts[0];
    const prefix = getLongestCommonPrefix(allItemNameCandidates).trimEnd();
    return {
      type: 'NormalizationOnly',
      normalizedText: matchedText.length < prefix.length ? prefix : matchedText,
    };
  }
  if (matchedSimilarLookingTexts.length) {
    console.warn(
      'Unexpected to match more than one similar looking texts',
      matchedSimilarLookingTexts
    );
  }

  return {
    type: 'NoMatch',
  };
}

async function getItemNameFilter(
  getItemIcon: (itemType: ItemType) => Promise<ItemIcon | null>,
  itemNamePrefix: string
): Promise<RegExp | null> {
  const itemType = inferItemType(itemNamePrefix);
  if (!itemType) {
    return null;
  }
  const itemIcon = await getItemIcon(itemType);
  if (!itemIcon) {
    return null;
  }
  return getItemNameFilterBy(itemIcon);
}

/** Supports Chinese and a subset of items with ambiguous names. */
function inferItemType(text: string): ItemType | null {
  for (const [itemType, regExp] of Object.entries(itemTypeNameRegexps)) {
    if (text.search(regExp) !== -1) {
      return itemType as ItemType;
    }
  }
  return null;
}

const itemTypeNameRegexps: { readonly [T in ItemType]: RegExp } = {
  LaserRigBlueprint: /^(激光炮|冷凝能量管理单元)/,
  DroneRigBlueprint: /^无人机/,
  ArmorRigBlueprint: /^(纳米机器人|辅助纳米聚合|维修增效|三角装甲|反(爆破|电磁|动能|热能)(聚合|横贯舱壁)|横贯舱壁)/,
  EngineeringRigBlueprint: /^(半导体记忆电池|电容器控制电路|辅助能量路由器|锁定系统辅助)/,
  ScanRigBlueprint: /^(引力电容器升级|放射范围约束)/,
  MiningRigBlueprint: /^采矿器/,
  RailgunRigBlueprint: /^磁轨炮/,
  NavigationRigBlueprint: /^(动态燃料控制阀|超空间速度|货柜舱优化|辅助推进器|复合碳素|希格斯粒子|跃迁核心优化)/,
};

function getItemNameFilterBy(itemIcon: ItemIcon): RegExp {
  switch (itemIcon.type) {
    case 'BlueprintIcon': {
      const { techLevel } = itemIcon;
      return new RegExp(`蓝图 ${'I'.repeat(techLevel)}$`);
    }
  }
}

function getLongestCommonPrefix(texts: readonly string[]): string {
  const shortestText = _.minBy(texts, (text) => text.length)!;
  for (let index = 0; index < shortestText.length; index++) {
    if (texts.some((text) => text.charAt(index) !== shortestText.charAt(index))) {
      return shortestText.slice(0, index);
    }
  }
  return shortestText;
}

export type NormalizationResult =
  | {
      // An exactly matching item name is found.
      readonly type: 'ExactMatch';
      readonly text: string;
    }
  | {
      // No uniquely matching item name is found, but the text is normalized.
      readonly type: 'NormalizationOnly';
      readonly normalizedText: string;
    }
  | {
      // No uniquely matching item name is found, nor is the text normalized.
      readonly type: 'NoMatch';
    };

function listSimilarLookingTexts(text: string): ReadonlySet<string> {
  const characters = [...text];
  const substitutions = characters.flatMap((character, index) =>
    similarLookingCharacterMapping
      .filter(([fromCharacter]) => fromCharacter === character)
      .map(([, toCharacter]): readonly [number, string] => [index, toCharacter])
  );
  const texts = new Set<string>();
  for (const substitutionSubset of powerSet(substitutions)) {
    for (const [index, toCharacter] of substitutionSubset) {
      characters[index] = toCharacter;
    }
    texts.add(characters.join(''));
    for (const [index] of substitutionSubset) {
      characters[index] = text.charAt(index);
    }
  }
  return texts;
}

/** It is an error to add the same letter in different cases. */
const similarLookingCharacterMapping: readonly (readonly [string, string])[] = [
  ['\\', 'l'],
  ['I', 'l'],
  ['L', 'I'],
  ['l', 'I'],
  ['l', 'i'],
  ['B', '8'],
  ['O', 'D'],
  ['O', '0'],
  ['o', 'c'],
  ['S', '5'],
  ['f', '人'],
  ['H', 'll'],
  ['H', 'il'],
  ['D', 'o'],
  ['「', 'r'],
  ['几', '机'],
  ['爻', '反'],
  ['逮', '速'],
  ['哥', '图'],
  ['呈', '量'],
  ['皇', '量'],
  ['蠹', '量'],
  ['重', '量'],
  ['童', '量'],
  ['矗', '量'],
  ['虹', '血'],
  ['抖', '科'],
  ['囊', '复'],
  ['藁', '复'],
  ['薹', '复'],
  ['簪', '管'],
  ['譬', '管'],
  ['B', '管'],
  ['桃', '挑'],
  ['姚', '挑'],
  ['肮', '航'],
  ['固', '国'],
  ['兽', '鲁'],
  ['立', '位'],
  ['胃', '胄'],
  ['川', 'III'],
  ['豇', '置'],
  ['薹', '置'],
  ['薹', '鲁'],
  ['膏', '鲁'],
  ['矗', '鲁'],
  ['·', '鲁'],
  ['坩', '增'],
  ['夭', '天'],
  ['然', '燃'],
];

function trimEllipsis(text: string): string {
  const ellipsisTemplate = '...';
  if (text.endsWith('...')) {
    return text.slice(0, -ellipsisTemplate.length);
  }
  return text;
}

function findItemNamesByPrefix(prefix: string, includeExactMatch: boolean): readonly string[] {
  const candidates = findTextsByPrefix(getSemanticIdentifier(prefix), itemNameTrie);
  if (includeExactMatch) {
    return candidates;
  }
  return candidates.filter((candidate) => candidate !== prefix);
}

// It is perceivably slow to search the database of in-game texts, so optimized with a trie.
const itemNameTrie = makeTrie(
  texts.flatMap(({ zh, en }) => [zh, en]),
  getSemanticIdentifier
);

export default normalizeItemName;
