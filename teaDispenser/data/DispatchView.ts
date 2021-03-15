type DispatchView<S, C> = (state: S, context: C) => Promise<void>;

export default DispatchView;
