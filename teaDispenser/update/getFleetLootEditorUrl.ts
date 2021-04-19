import MessageServiceProvider from '../data/MessageServiceProvider';
import webServerBaseUrl from '../data/webServerBaseUrl';

function getFleetLootEditorUrl(
  serviceProvider: MessageServiceProvider,
  channelId: string,
  messageId: string
): string {
  return `${webServerBaseUrl}/editor/${serviceProvider}/${channelId}/${messageId}`;
}

export default getFleetLootEditorUrl;
