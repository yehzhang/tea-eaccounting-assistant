import DispatchView from '../data/DispatchView';
import logInfo from './logInfo';

function createDispatchView<V, R, A extends readonly unknown[]>(
  render: (view: V) => R,
  dispatchRendering: (rendering: R, ...args: A) => Promise<boolean>
): DispatchView<V, A> {
  return async (view, ...args) => {
    logInfo('[Core] view', view, /* depth= */ null);

    const rendering = render(view);
    return dispatchRendering(rendering, ...args);
  };
}

export default createDispatchView;
