import _ from 'lodash';
import { findTextsByPrefix, makeTrie } from './trie';

describe('trie', () => {
  it('makes a trie', () => {
    const trie = buildTrie();
    expect(trie).toEqual({
      texts: [],
      children: {
        '秃': {
          texts: [],
          children: {
            '鹫': {
              texts: [],
              children: {
                '级': {
                  texts: ['秃鹫级'],
                  children: {
                    ' ': {
                      texts: [],
                      children: {
                        I: {
                          texts: [],
                          children: { I: { texts: ['秃鹫级 II'], children: {} } },
                        },
                      },
                    },
                  },
                },
              },
            },
            '鹰': {
              texts: [],
              children: { '级': { texts: ['秃鹰级'], children: {} } },
            },
          },
        },
      },
    });
  });

  it('finds texts by a prefix', () => {
    const trie = buildTrie();
    expect(findTextsByPrefix('秃鹫', trie)).toEqual(['秃鹫级', '秃鹫级 II']);
  });

  it('finds texts by a prefix, including an exact match', () => {
    const trie = buildTrie();
    expect(findTextsByPrefix('秃鹫级', trie)).toEqual(['秃鹫级', '秃鹫级 II']);
  });
});

function buildTrie() {
  return makeTrie(['秃鹫级', '秃鹫级 II', '秃鹰级', '秃鹫级'], _.identity);
}
