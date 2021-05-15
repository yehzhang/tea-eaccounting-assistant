import Awaitable from './Awaitable';

class Reader<C, R> {
  constructor(private executor: (context: C) => Awaitable<R | Reader<C, R>>) {}

  async run(context: C): Promise<R> {
    let r = await this.executor(context);
    return r instanceof Reader ? r.run(context) : r;
  }

  mapContext<D>(f: (context: D) => C): Reader<D, R> {
    return new Reader((context) => this.run(f(context)));
  }

  bind<D, S>(f: (r: R) => Awaitable<Reader<D, S> | S>): Reader<C & D, S> {
    return new Reader(async (context) => f(await this.run(context)));
  }

  sequence<D, S>(reader: Reader<D, S>): Reader<C & D, S> {
    return new Reader(async (context) => {
      await this.run(context);
      return reader.run(context);
    });
  }

  replace<S>(s: S): Reader<C, S> {
    return new Reader(async (context) => {
      await this.run(context);
      return s;
    });
  }

  discard(): Reader<C, void> {
    return this.replace(undefined);
  }
}

export default Reader;
