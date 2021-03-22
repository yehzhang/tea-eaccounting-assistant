type DispatchView<S, C> = (view: S, context: C) => Promise<void>;

export default DispatchView;
