import Reader from './Reader';

function allReaders<C, R>(readers: readonly [Reader<C, R>]): Reader<C, [R]>;
function allReaders<C, R1, R2>(
  readers: readonly [Reader<C, R1>, Reader<C, R2>]
): Reader<C, [R1, R2]>;
function allReaders<C, R1, R2, R3>(
  readers: readonly [Reader<C, R1>, Reader<C, R2>, Reader<C, R3>]
): Reader<C, [R1, R2, R3]>;
function allReaders<C, R1, R2, R3, R4>(
  readers: readonly [Reader<C, R1>, Reader<C, R2>, Reader<C, R3>, Reader<C, R4>]
): Reader<C, [R1, R2, R3, R4]>;
function allReaders<C, R>(readers: readonly Reader<C, R>[]): Reader<C, readonly R[]>;
function allReaders<C, R>(readers: readonly Reader<C, R>[]): Reader<C, readonly R[]> {
  return new Reader((context) => Promise.all(readers.map((reader) => reader.run(context))));
}

export default allReaders;
