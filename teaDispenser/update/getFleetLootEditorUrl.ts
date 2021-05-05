import { TeaDispenserService } from '../data/ChatService';
import toUrlFriendlyChatService from '../data/toUrlFriendlyChatService';
import webServerBaseUrl from '../external/webServerBaseUrl';

function getFleetLootEditorUrl(
  serviceProvider: TeaDispenserService,
  channelId: string,
  messageId: string
): string {
  return `${webServerBaseUrl}/editor/${toUrlFriendlyChatService(
    serviceProvider
  )}/${channelId}/${messageId}`;
}

export default getFleetLootEditorUrl;
