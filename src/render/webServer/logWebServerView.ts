import Reader from '../../core/Reader/Reader';
import log from '../../external/log';
import WebPageView from './view/WebPageView';
import WebServerRenderingContext from './WebServerRenderingContext';

function logWebServerView(view: WebPageView): Reader<WebServerRenderingContext, void> {
  return new Reader(() => {
    if (view.type === 'IndexView') {
      return;
    }
    return log({
      type: 'view',
      data: view,
    });
  });
}

export default logWebServerView;
