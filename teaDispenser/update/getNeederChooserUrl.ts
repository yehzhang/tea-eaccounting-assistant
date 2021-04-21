import ChatService from '../data/ChatService';
import webServerBaseUrl from '../external/webServerBaseUrl';

function getNeederChooserUrl(
  serviceProvider: ChatService,
  channelId: string,
  messageId: string
): string {
  return `${webServerBaseUrl}/needs-editor/${serviceProvider}/${channelId}/${messageId}`;
}

export default getNeederChooserUrl;
