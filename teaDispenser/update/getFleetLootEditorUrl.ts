import webServerBaseUrl from '../data/webServerBaseUrl';

function getFleetLootEditorUrl(channelId: string, messageId: string): string {
  return `${webServerBaseUrl}/editor/discord/${channelId}/${messageId}`;
}

export default getFleetLootEditorUrl;
