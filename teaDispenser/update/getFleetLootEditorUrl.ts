import ChatService from '../data/ChatService';
import webServerBaseUrl from '../external/webServerBaseUrl';

function getFleetLootEditorUrl(
  serviceProvider: ChatService,
  channelId: string,
  messageId: string
): string {
  return `${webServerBaseUrl}/editor/${serviceProvider}/${channelId}/${messageId}`;
}

export default getFleetLootEditorUrl;
