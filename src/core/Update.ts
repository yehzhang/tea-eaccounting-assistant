import Reader from './Reader/Reader';

type Update<E, C> = (event: E) => Reader<C, unknown>;

export default Update;
