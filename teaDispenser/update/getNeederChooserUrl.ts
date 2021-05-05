import { TeaDispenserService } from '../data/ChatService';
import toUrlFriendlyChatService from '../data/toUrlFriendlyChatService';
import webServerBaseUrl from '../external/webServerBaseUrl';

function getNeederChooserUrl(
  serviceProvider: TeaDispenserService,
  channelId: string,
  messageId: string
): string {
  return `${webServerBaseUrl}/needs-editor/${toUrlFriendlyChatService(
    serviceProvider
  )}/${channelId}/${messageId}`;
}

export default getNeederChooserUrl;
