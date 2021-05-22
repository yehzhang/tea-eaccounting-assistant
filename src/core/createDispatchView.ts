import DispatchView from './DispatchView';
import Reader from './Reader/Reader';

function createDispatchView<V, R, A extends readonly unknown[], C>(
  render: (view: V) => R,
  dispatchRendering: (rendering: R) => Reader<C, boolean>,
  logView: (view: V, rendering: R) => Reader<C, void>
): DispatchView<V, C> {
  return (view) => {
    const rendering = render(view);
    return logView(view, rendering).sequence(dispatchRendering(rendering));
  };
}

export default createDispatchView;
