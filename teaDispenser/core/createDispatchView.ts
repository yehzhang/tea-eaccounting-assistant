import DispatchView from '../data/DispatchView';

function createDispatchView<S, R, C>(
  render: (view: S) => R,
  dispatchRendering: (rendering: R, context: C) => Promise<void>
): DispatchView<any, any> {
  return async (view: S, context: C) => {
    console.info('[Core] view', view);

    const rendering = render(view);

    console.info('[Core] rendering', rendering);

    return dispatchRendering(rendering, context);
  };
}

export default createDispatchView;
