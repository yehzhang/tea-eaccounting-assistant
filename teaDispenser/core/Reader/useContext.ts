import Reader from './Reader';

function useContext<C, R, D>(context: C, reader: Reader<C & D, R>): Reader<D, R> {
  return new Reader((_context) =>
    reader.run({
      ..._context,
      ...context,
    }));
}

export default useContext;
