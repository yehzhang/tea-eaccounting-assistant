type DispatchView<S, C, A extends readonly unknown[] = []> = (
  view: S,
  context: C,
  ...args: A
) => Promise<boolean>;

export default DispatchView;
