import MessageContext from '../../data/MessageContext';
import toUrlFriendlyChatService from '../../data/toUrlFriendlyChatService';
import webServerBaseUrl from '../../external/webServer/webServerBaseUrl';

function getFleetLootEditorUrl({ chatService, channelId, messageId }: MessageContext): string {
  return `${webServerBaseUrl}/editor/${toUrlFriendlyChatService(
    chatService
  )}/${channelId}/${messageId}`;
}

export default getFleetLootEditorUrl;
