import Reader from '../../../core/Reader/Reader';
import dispatchView from '../../../render/webServer/dispatchView';
import WebServerRenderingContext from '../../../render/webServer/WebServerRenderingContext';

function updateOnWebIndexRequested(): Reader<WebServerRenderingContext, boolean> {
  return dispatchView({ type: 'IndexView' });
}

export default updateOnWebIndexRequested;
