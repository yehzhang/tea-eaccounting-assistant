function* powerSet<T>(set: readonly T[], offset = 0): Generator<T[]> {
  yield [];
  while (offset < set.length) {
    let first = set[offset++];
    for (const subset of powerSet(set, offset)) {
      subset.push(first);
      yield subset;
    }
  }
}

export default powerSet;
