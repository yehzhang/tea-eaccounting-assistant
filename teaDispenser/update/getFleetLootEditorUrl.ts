import webServerBaseUrl from '../data/webServerBaseUrl';

function getFleetLootEditorUrl(
  serviceProvider: 'discord' | 'kaiheila',
  channelId: string,
  messageId: string
): string {
  return `${webServerBaseUrl}/editor/${serviceProvider}/${channelId}/${messageId}`;
}

export default getFleetLootEditorUrl;
