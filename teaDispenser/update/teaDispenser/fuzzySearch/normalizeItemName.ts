import * as _ from 'lodash';
import texts from '../../../../generated/textPacks.json';
import ItemIcon from '../../../data/ItemIcon';
import ItemType from '../../../data/ItemType';
import { findTextsByPrefix, makeTrie } from '../../../data/trie';
import getSemanticIdentifier from './getSemanticIdentifier';
import powerSet from './powerSet';

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
    .replace(/士[兽曾普]/g, '增')
    .replace(/」艺/g, '应')
    .replace(/力[口D]/g, '加')
    .replace(/[百弓豆三]虽/g, '强')
    .replace(/木几/g, '机')
    .replace(/木反/g, '板')
    .replace(/\\\\/g, 'l')
    .replace(/[/′]」\\/g, '小')
    .replace(/苷旨/g, '能')
    .replace(/弓\s*I/g, '引')
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
  DecomposerRigBlueprint: /^裂解炮/,
  NavigationRigBlueprint: /^(动态燃料控制阀|超空间速度|货柜舱优化|辅助推进器|复合碳素|希格斯粒子|跃迁核心优化)/,
};

function getItemNameFilterBy(itemIcon: ItemIcon): RegExp {
  switch (itemIcon.type) {
    case 'BlueprintIcon': {
      const { techLevel } = itemIcon;
      return new RegExp(`蓝图 ${techLevel === 4 ? 'IV' : 'I'.repeat(techLevel)}$`);
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
  ['[', 'l'],
  ['[', 'I'],
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
  ['迭', '速'],
  ['矿', '扩'],
  ['哥', '图'],
  ['田', '图'],
  ['日', '图'],
  ['囡', '图'],
  ['囱', '图'],
  ['囝', '图'],
  ['田', '围'],
  ['呈', '量'],
  ['皇', '量'],
  ['蠹', '量'],
  ['重', '量'],
  ['童', '量'],
  ['矗', '量'],
  ['虹', '血'],
  ['抖', '科'],
  ['纂', '复'],
  ['囊', '复'],
  ['蠹', '复'],
  ['藁', '复'],
  ['薹', '复'],
  ['薹', '管'],
  ['琶', '管'],
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
  ['亿', '忆'],
  ['贾', '置'],
  ['豇', '置'],
  ['薹', '置'],
  ['量', '置'],
  ['覃', '置'],
  ['·', '置'],
  ['罡', '置'],
  ['篝', '置'],
  ['装', '装置'],
  ['覃', '鲁'],
  ['薹', '鲁'],
  ['膏', '鲁'],
  ['矗', '鲁'],
  ['音', '鲁'],
  ['叠', '鲁'],
  ['蠹', '鲁'],
  ['·', '鲁'],
  ['官', '增'],
  ['坩', '增'],
  ['馏', '增'],
  ['堵', '增'],
  ['悟', '增'],
  ['蹭', '增'],
  ['强', '增强'],
  ['夭', '天'],
  ['然', '燃'],
  ['贡', '贯'],
  ['贵', '贯'],
  ['囊', '聚'],
  ['鬟', '聚'],
  ['藁', '聚'],
  ['窟', '器'],
  ['峰', '修'],
  ['度', '魔'],
  ['糟', '槽'],
  ['棒', '槽'],
  ['蔑', '装'],
  ['丈', '大'],
  ['犬', '大'],
  ['彦', '修'],
  ['廖', '修'],
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
