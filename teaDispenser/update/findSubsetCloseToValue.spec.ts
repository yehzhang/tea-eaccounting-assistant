import findSubsetCloseToValue from './findSubsetCloseToValue';

describe('findSubsetCloseToValue', () => {
  it('works for complex case', () => {
    const actual = findSubsetCloseToValue([1, 1, 2, 2, 3, 3], 6, x => x);
    expect(actual).toEqual(jasmine.arrayContaining([1, 1, 2, 2]));
  });

  it('works for simple case 1', () => {
    const actual = findSubsetCloseToValue([1, 1], 2, x => x);
    expect(actual).toEqual([1, 1]);
  });

  it('works for simple case 2', () => {
    const actual = findSubsetCloseToValue([2], 1, x => x);
    expect(actual).toEqual([2]);
  });

  it('works for empty set', () => {
    const actual = findSubsetCloseToValue([], 1, x => x);
    expect(actual).toEqual([]);
  });
});
