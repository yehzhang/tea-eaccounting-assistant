import RenderedWebPage from '../data/RenderedWebPage';
import WebServerEventContext from '../data/WebServerEventContext';

async function sendHttpResponse(
  webPage: RenderedWebPage,
  { response }: WebServerEventContext
): Promise<void> {
  const { html } = webPage;
  response.send(html);
}

export default sendHttpResponse;
