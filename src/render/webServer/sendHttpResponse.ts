import Reader from '../../core/Reader/Reader';
import RenderedWebPage from '../../data/RenderedWebPage';
import WebServerRenderingContext from './WebServerRenderingContext';

function sendHttpResponse(webPage: RenderedWebPage): Reader<WebServerRenderingContext, boolean> {
  return new Reader(({ koaContext }) => {
    const { html } = webPage;
    koaContext.body = html;

    return true;
  });
}

export default sendHttpResponse;
