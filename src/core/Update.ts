import Reader from './Reader/Reader';

type Update<E, C> = (event: E) => Reader<C, void>;

export default Update;
