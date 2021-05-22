import Reader from './Reader';

/** Sequentially runs through each reader and collects results. */
function sequenceReaders<C, R>(readers: readonly Reader<C, R>[]): Reader<C, readonly R[]> {
  return new Reader(async (context) => {
    const rs = [];
    for (const reader of readers) {
      const r = await reader.run(context);
      rs.push(r);
    }
    return rs;
  });
}

export default sequenceReaders;
