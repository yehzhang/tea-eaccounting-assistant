import Reader from './Reader/Reader';
import useContext from './Reader/useContext';
import Update from './Update';

function runUpdateWithEventContext<E extends { type: string }, UC extends UpdateConfig<E>>(
  updateConfig: UC,
  event: E
): CombinedUpdateContextWithEvent<E, UC> {
  return useContext(event, (updateConfig as any)[event.type](event));
}

type UpdateConfig<E extends { type: string }> = {
  [T in E['type']]: E extends { type: T } ? Update<E, any> : unknown;
};

type CombinedUpdateContextWithEvent<
  E extends { type: string },
  UC extends UpdateConfig<E>
> = Reader<
  UnionToIntersection<E extends unknown ? SupplyUpdateContextWithEvent<E, UC[E['type']]> : never>,
  boolean
>;

type SupplyUpdateContextWithEvent<E, U> = U extends Update<unknown, infer C>
  ? Omit<C, keyof E>
  : never;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
  ? I
  : never;

export default runUpdateWithEventContext;
