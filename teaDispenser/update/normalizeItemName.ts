import * as _ from 'lodash';
import { itemNames } from '../data/itemNames';
import { powerSet } from './powerSet';

export function normalizeItemName(text: string): NormalizationResult {
  const fuzzyText = text.replace(/’/g, `'`).replace(/ 一 /g, ' - ');
  const ellipsisFreeText = trimEllipsis(fuzzyText);
  // If the text contains ellipsis, the name must not be a full name. Otherwise, the name may or may
  // not be a full name, because the ellipsis may or may not be recognized.
  const hasEllipsis = fuzzyText !== ellipsisFreeText;
  const similarLookingTexts = listSimilarLookingTexts(ellipsisFreeText);
  const matchedSimilarLookingTexts = [];
  const allItemNameCandidates = [];
  for (const similarLookingText of similarLookingTexts) {
    const itemNameCandidates = findItemNamesByPrefix(similarLookingText, !hasEllipsis);
    if (!itemNameCandidates.length) {
      continue;
    }
    if (itemNameCandidates.length === 1) {
      return {
        type: 'ExactMatch',
        text: itemNameCandidates[0],
      };
    }
    const matchingCandidate = itemNameCandidates.find(candidate => fuzzyEqual(candidate, similarLookingText));
    if (matchingCandidate !== undefined) {
      return {
        type: 'ExactMatch',
        text: matchingCandidate,
      };
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

  return {
    type: 'NoMatch',
  };
}

function getLongestCommonPrefix(texts: readonly string[]): string {
  const shortestText = _.minBy(texts, text => text.length)!;
  for (let index = 0; index < shortestText.length; index++) {
    if (texts.some(text => text.charAt(index) !== shortestText.charAt(index))) {
      return shortestText.slice(0, index);
    }
  }
  return shortestText;
}

type NormalizationResult = {
  // An exactly matching item name is found.
  readonly type: 'ExactMatch';
  readonly text: string;
} | {
  // No uniquely matching item name is found, but the text is normalized.
  readonly type: 'NormalizationOnly';
  readonly normalizedText: string;
} | {
  // No uniquely matching item name is found, nor is the text normalized.
  readonly type: 'NoMatch';
}

function listSimilarLookingTexts(text: string): readonly string[] {
  const characters = [...text];
  const similarLookingIndices = characters
      .map((character, index) => similarLookingCharacterMapping.has(character) ? index : null)
      .filter((index): index is number => index !== null);
  const texts = [];
  for (const indices of powerSet(similarLookingIndices)) {
    for (const index of indices) {
      characters[index] = similarLookingCharacterMapping.get(characters[index])!;
    }
    texts.push(characters.join(''));
    for (const index of indices) {
      characters[index] = text.charAt(index);
    }
  }
  return texts;
}

const similarLookingCharacterMapping: ReadonlyMap<string, string> = new Map([
  ['I', 'l'],
  ['B', '8'],
  ['O', 'D'],
  ['o', 'c'],
  ['逮', '速'],
  ['哥', '图'],
  ['呈', '量'],
  ['蠹', '量'],
  ['虹', '血'],
  ['抖', '科'],
]);

function trimEllipsis(text: string): string {
  while (true) {
    let trimmedText = text;
    for (const ellipsisTemplate of ellipsisTemplates) {
      if (text.endsWith(ellipsisTemplate)) {
        trimmedText = text.slice(0, -ellipsisTemplate.length);
        break;
      }
    }
    if (trimmedText === text) {
      return trimmedText;
    }
    text = trimmedText;
  }
}

const ellipsisTemplates = ['…', '...'];

function findItemNamesByPrefix(prefix: string, includeExactMatch: boolean): string[] {
  const candidates = itemNames.filter(
      candidate => getFuzzyText(candidate).startsWith(getFuzzyText(prefix)));
  if (includeExactMatch) {
    return candidates;
  }
  return candidates.filter(candidate => candidate !== prefix);
}

function fuzzyEqual(text: string, other: string): boolean {
  return getFuzzyText(text) === getFuzzyText(other);
}

function getFuzzyText(text: string): string {
  return text.replace(/ /g, '').toLocaleLowerCase();
}
