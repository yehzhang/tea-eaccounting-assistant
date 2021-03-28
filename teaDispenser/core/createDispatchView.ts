import DispatchView from '../data/DispatchView';
import logInfo from './logInfo';

function createDispatchView<V, R, C, A extends readonly unknown[]>(
  render: (view: V) => R,
  dispatchRendering: (rendering: R, context: C, ...args: A) => Promise<boolean>
): DispatchView<V, C, A> {
  return async (view, context, ...args) => {
    logInfo('[Core] view', view, /* depth= */ null);

    const rendering = render(view);
    return dispatchRendering(rendering, context, ...args);
  };
}

export default createDispatchView;
