import DispatchView from '../data/DispatchView';

function createDispatchView<S, R, C>(
  render: (state: S) => R,
  dispatchRendering: (rendering: R, context: C) => Promise<void>
): DispatchView<any, any> {
  return async (state: S, context: C) => {
    const renderings = render(state);
    return dispatchRendering(renderings, context);
  };
}

export default createDispatchView;
