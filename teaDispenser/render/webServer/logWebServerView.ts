import Reader from '../../core/Reader/Reader';
import log from '../../external/log';
import WebPageView from './view/WebPageView';
import WebServerRenderingContext from './WebServerRenderingContext';

function logWebServerView(view: WebPageView): Reader<WebServerRenderingContext, void> {
  return new Reader((context) => {
    if (view.type === 'IndexView') {
      return;
    }

    const { koaContext: ignored, ...trimmedContext } = context;
    return log({
      type: 'view',
      data: view,
    }).run(trimmedContext);
  });
}

export default logWebServerView;
