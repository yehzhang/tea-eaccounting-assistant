import RenderedWebPage from '../data/RenderedWebPage';
import WebServerEventContext from '../data/WebServerEventContext';

async function sendHttpResponse(
  webPage: RenderedWebPage,
  { context }: WebServerEventContext
): Promise<boolean> {
  const { html } = webPage;
  context.body = html;

  return true;
}

export default sendHttpResponse;
