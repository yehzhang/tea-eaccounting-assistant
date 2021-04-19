type DispatchView<S, A extends readonly unknown[] = []> = (view: S, ...args: A) => Promise<boolean>;

export default DispatchView;
