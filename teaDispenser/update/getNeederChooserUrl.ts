import webServerBaseUrl from '../data/webServerBaseUrl';

function getNeederChooserUrl(channelId: string, messageId: string): string {
  return `${webServerBaseUrl}/needs-editor/discord/${channelId}/${messageId}`;
}

export default getNeederChooserUrl;
