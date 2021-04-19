import MessageServiceProvider from '../data/MessageServiceProvider';
import webServerBaseUrl from '../data/webServerBaseUrl';

function getNeederChooserUrl(
  serviceProvider: MessageServiceProvider,
  channelId: string,
  messageId: string
): string {
  return `${webServerBaseUrl}/needs-editor/${serviceProvider}/${channelId}/${messageId}`;
}

export default getNeederChooserUrl;
