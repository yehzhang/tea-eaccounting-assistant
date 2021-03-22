import DispatchView from '../data/DispatchView';

function createDispatchView<S, R, C>(
  render: (view: S) => R,
  dispatchRendering: (rendering: R, context: C) => Promise<void>
): DispatchView<any, any> {
  return async (view: S, context: C) => {
    const rendering = render(view);
    return dispatchRendering(rendering, context);
  };
}

export default createDispatchView;
