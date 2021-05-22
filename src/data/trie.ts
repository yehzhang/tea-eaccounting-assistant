export function makeTrie(texts: readonly string[], getIndex: (text: string) => string): Trie {
  const root: Writable<Trie> = {
    texts: [],
    children: {},
  };
  for (const text of texts) {
    const trie = [...getIndex(text)].reduce((trie, character) => {
      if (!(character in trie.children)) {
        trie.children[character] = {
          texts: [],
          children: {},
        };
      }
      return trie.children[character];
    }, root);
    if (!trie.texts.includes(text)) {
      trie.texts.push(text);
    }
  }

  return root;
}

export function findTextsByPrefix(prefix: string, trie: Trie): readonly string[] {
  const result: string[] = [];
  const root = findTrie(prefix, trie);
  if (root) {
    listTexts(result, root, '');
  }
  return result;
}

function findTrie(prefix: string, trie: Trie): Trie | null {
  let currentTrie = trie;
  for (const character of prefix) {
    currentTrie = currentTrie.children[character];
    if (!currentTrie) {
      return null;
    }
  }
  return currentTrie;
}

function listTexts(result: string[], trie: Trie, prefix: string): void {
  result.push(...trie.texts);
  for (const [character, child] of Object.entries(trie.children)) {
    listTexts(result, child, prefix + character);
  }
}

interface Trie {
  readonly texts: readonly string[];
  readonly children: { readonly [character: string]: Trie };
}

type Writable<T> = {
  -readonly [K in keyof T]: Writable<T[K]>;
};
