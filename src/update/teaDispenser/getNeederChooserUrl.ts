import MessageContext from '../../data/MessageContext';
import toUrlFriendlyChatService from '../../data/toUrlFriendlyChatService';
import webServerBaseUrl from '../../external/webServer/webServerBaseUrl';

function getNeederChooserUrl({ chatService, channelId, messageId }: MessageContext): string {
  return `${webServerBaseUrl}/needs-editor/${toUrlFriendlyChatService(
    chatService
  )}/${channelId}/${messageId}`;
}

export default getNeederChooserUrl;
