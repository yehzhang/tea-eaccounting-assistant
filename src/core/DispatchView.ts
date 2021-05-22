import Reader from './Reader/Reader';

type DispatchView<S, C> = (view: S) => Reader<C, boolean>;

export default DispatchView;
