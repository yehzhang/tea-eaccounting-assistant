import createDispatchView from '../../core/createDispatchView';
import DispatchView from '../../core/DispatchView';
import logWebServerView from './logWebServerView';
import sendHttpResponse from './sendHttpResponse';
import viewWebPage from './view/viewWebPage';
import WebPageView from './view/WebPageView';
import WebServerRenderingContext from './WebServerRenderingContext';

const dispatchView: DispatchView<WebPageView, WebServerRenderingContext> = createDispatchView(
  viewWebPage,
  sendHttpResponse,
  logWebServerView
);

export default dispatchView;
