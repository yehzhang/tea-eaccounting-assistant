import DispatchView from '../data/DispatchView';
import WebPageView from '../view/webPage/WebPageView';

function updateOnWebIndexRequested(dispatchView: DispatchView<WebPageView>): Promise<boolean> {
  return dispatchView({ type: 'IndexView' });
}

export default updateOnWebIndexRequested;
