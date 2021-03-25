import RenderedWebPage from '../data/RenderedWebPage';
import WebServerEventContext from '../data/WebServerEventContext';

async function sendHttpResponse(
  webPage: RenderedWebPage,
  { context }: WebServerEventContext
): Promise<void> {
  const { html } = webPage;
  context.body = html;
}

export default sendHttpResponse;
